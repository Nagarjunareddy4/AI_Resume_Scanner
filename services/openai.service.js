// services/openai.service.js
// Minimal wrapper to call OpenAI Chat Completions from server-side.
// NEVER logs prompt/response. Uses server-side API key only.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || null;
const DEFAULT_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 60000;

export async function callOpenAI({ model = 'gpt-4o-mini', messages = [], max_tokens = 512, temperature = 0.2 } = {}) {
  if (!OPENAI_API_KEY) return { ok: false, error: 'ai_unavailable' };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({ model, messages, max_tokens, temperature })
    });
    clearTimeout(id);

    // OpenAI errors: treat 429 as service unavailable for the client
    if (resp.status === 429) {
      return { ok: false, error: 'ai_unavailable' };
    }
    if (resp.status >= 500) {
      return { ok: false, error: 'ai_unavailable' };
    }

    if (!resp.ok) {
      return { ok: false, error: 'ai_unavailable' };
    }

    const json = await resp.json();
    // Return AI JSON payload unmodified (no logging, no persistence)
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: 'ai_unavailable' };
  }
}
