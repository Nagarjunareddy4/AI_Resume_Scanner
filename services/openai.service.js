// services/openai.service.js
// Minimal wrapper to call OpenAI Chat Completions from server-side.
// NEVER logs prompt/response. Uses server-side API key only.


const DEFAULT_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 60000;

export async function callOpenAI({
  model = 'gpt-4o-mini',
  messages = [],
  max_tokens = 512,
  temperature = 0.2
} = {}) {

  const OPENAI_API_KEY =
    process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || null;
  if (!OPENAI_API_KEY) return { ok: false, error: 'ai_unavailable' };

  // 🔎 TEMP LOG — safe (no secrets, no prompt)
  console.log('[AI DEBUG] OpenAI request started');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    console.log('[AI DEBUG] typeof fetch:', typeof fetch);

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({ model, messages, max_tokens, temperature })
    });

    // 🔎 TEMP LOG — status only (safe)
    console.log('[AI DEBUG] OpenAI response status:', resp.status);

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
    return { ok: true, data: json };

  } catch (err) {
    return { ok: false, error: 'ai_unavailable' };
  } finally {
    clearTimeout(timeoutId);
  }
}
