// api/ai.js
// Serverless AI proxy endpoint (Vercel-friendly ESM). Does NOT log prompts/responses.
// Enforces anonymous per-clientId quota using an in-memory store (quota.service.js).

import { checkQuota, incrementQuota } from '../services/quota.service.js';
import { callOpenAI } from '../services/openai.service.js';

// Config
const DEFAULT_MAX_PROMPT_CHARS = 8000;
const DEFAULT_MAX_RESPONSE_TOKENS = 512;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
      return;
    }

    const body = req.body || {};
    const clientId = body.clientId || null;
    const prompt = body.prompt || '';
    const options = body.options || {};

    // Basic validation
    if (!clientId || typeof clientId !== 'string') {
      res.status(400).json({ ok: false, error: 'client_id_required' });
      return;
    }

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ ok: false, error: 'prompt_required' });
      return;
    }

    if (prompt.length > DEFAULT_MAX_PROMPT_CHARS) {
      res.status(400).json({ ok: false, error: 'prompt_too_long' });
      return;
    }

    const requestedMaxTokens = Number(options.max_tokens || options.maxResponseTokens || DEFAULT_MAX_RESPONSE_TOKENS);
    if (requestedMaxTokens > DEFAULT_MAX_RESPONSE_TOKENS) {
      res.status(400).json({ ok: false, error: 'max_tokens_exceeded' });
      return;
    }

    // Enforce server-side quota
    const quotaCheck = checkQuota(clientId);
    if (!quotaCheck.ok) {
      // storage_unavailable or other internal error — fail closed
      res.status(500).json({ ok: false, error: 'ai_unavailable' });
      return;
    }

    if (quotaCheck.remaining <= 0) {
      res.status(429).json({ ok: false, error: 'quota_exceeded' });
      return;
    }

    // Build messages for ChatCompletion
    const messages = [];
    if (options.system && typeof options.system === 'string') messages.push({ role: 'system', content: options.system });
    messages.push({ role: 'user', content: prompt });

    // Call OpenAI (server-side) — wrapper handles API key and timeouts
    const openaiResp = await callOpenAI({ model: options.model || process.env.AI_MODEL || 'gpt-4o-mini', messages, max_tokens: requestedMaxTokens, temperature: 0.2 });

    if (!openaiResp || !openaiResp.ok) {
      // OpenAI or network failure — return safe error
      res.status(500).json({ ok: false, error: 'ai_unavailable' });
      return;
    }

    // Success — increment quota and return data
    try {
      incrementQuota(clientId);
    } catch (err) {
      // Do not fail if quota increment fails — best-effort
    }

    // Return OpenAI data directly (JSON-only)
    res.status(200).json({ ok: true, data: openaiResp.data });
  } catch (err) {
    // Generic fallback
    res.status(500).json({ ok: false, error: 'ai_unavailable' });
  }
}

// For non-ESM hosts, also export a commonjs handler if possible
// (some deployment targets may require module.exports). Keep minimal.
try {
  if (typeof module !== 'undefined') module.exports = handler; // eslint-disable-line no-undef
} catch (e) {}
