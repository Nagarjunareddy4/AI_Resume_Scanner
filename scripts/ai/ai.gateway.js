// ai.gateway.js
// Centralized AI gateway that supports proxied server endpoints and an optional browser-fetch fallback for local/dev.
// All AI calls should go through window.callAI

( function () {
  // Use aiConfig if present, else safe defaults
  const cfg = window.aiConfig || {
    enabled: false,
    requireApiKey: true,
    freeCallsPerSession: 2,
    model: 'gpt-3.5-turbo',
    maxResponseTokens: 512,
    maxPromptTokens: 1024,
    minMsBetweenCalls: 500,
    persistResponses: false,
    logResponses: false
  };

  // Minimal token estimator
  function estimateTokens(text = '') {
    // Rough heuristic: ~4 chars per token
    return Math.ceil((text || '').length / 4);
  }

  // Safe structured fallback
  function fallbackResult(message) {
    return { ok: false, error: { message }, data: null, usage: null };
  }

  // Internal single-call implementation
  async function _callOpenAI(payload, { useProxy, proxyEndpoint, apiKey, browserFallback, timeoutMs = 60000 } = {}) {
    // Try proxy call first when requested
    if (useProxy && proxyEndpoint) {
      try {
        const resp = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          return fallbackResult(`Proxy request failed with status ${resp.status}`);
        }

        const json = await resp.json();
        return { ok: true, data: json, usage: json.usage || null };
      } catch (err) {
        return fallbackResult('Proxy request error');
      }
    }

    // Browser fetch fallback to OpenAI API (ONLY if allowed explicitly via config or options)
    if (browserFallback && apiKey) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify(payload)
        });
        clearTimeout(id);

        if (!resp.ok) {
          return fallbackResult(`OpenAI API returned status ${resp.status}`);
        }

        const json = await resp.json();
        return { ok: true, data: json, usage: json.usage || null };
      } catch (err) {
        return fallbackResult('OpenAI request error');
      }
    }

    return fallbackResult('No executable AI endpoint configured');
  }

  // Public API: callAI
  // prompt: string
  // options: { system?: string, parseJson?: boolean, model?: string, maxResponseTokens?: number, proxyEndpoint?: string, useProxy?: boolean, browserFallback?: boolean, apiKey?: string }
  async function callAI(prompt, options = {}) {
    try {
      if (!cfg.enabled) return fallbackResult('AI features are disabled');

      // Rate limiting: minMsBetweenCalls
      const now = Date.now();
      const session = window.__ai_session || (window.__ai_session = { callsThisSession: 0, lastCallTimestamp: 0 });
      if (now - (session.lastCallTimestamp || 0) < (cfg.minMsBetweenCalls || 0)) {
        return fallbackResult('Rate limited, please wait a moment');
      }

      // Free usage limit per session
      if (typeof cfg.freeCallsPerSession === 'number' && session.callsThisSession >= cfg.freeCallsPerSession) {
        return fallbackResult('Free AI usage limit reached for this session');
      }

      // Validate required API availability
      const proxyEndpoint = options.proxyEndpoint || cfg.proxyEndpoint || null;
      const browserFallback = options.browserFallback === true || window.aiConfig && window.aiConfig.browserFallback === true;
      const apiKey = options.apiKey || window.OPENAI_API_KEY || null;

      if (cfg.requireApiKey) {
        if (!proxyEndpoint && !(browserFallback && apiKey)) {
          return fallbackResult('AI disabled: no API key or proxy endpoint available');
        }
      }

      // Prompt token checks
      const promptTokens = estimateTokens(prompt);
      if (promptTokens > (cfg.maxPromptTokens || 1024) || promptTokens > (options.maxPromptTokens || cfg.maxPromptTokens || 1024)) {
        return fallbackResult('Prompt too long (exceeds token limit)');
      }

      // Build ChatCompletion messages
      const messages = [];
      if (options.system) messages.push({ role: 'system', content: options.system });
      messages.push({ role: 'user', content: prompt });

      const model = options.model || cfg.model || 'gpt-3.5-turbo';
      const maxResponseTokens = Math.min(options.maxResponseTokens || cfg.maxResponseTokens || 512, cfg.maxResponseTokens || 512);

      const payload = { model, messages, max_tokens: maxResponseTokens, temperature: 0.2 };

      // Enforce single try only (no retries)
      const useProxy = options.useProxy !== undefined ? options.useProxy : Boolean(proxyEndpoint);
      const res = await _callOpenAI(payload, { useProxy, proxyEndpoint, apiKey, browserFallback });

      if (!res.ok) return res; // bubble up fallback

      // Try to extract text. For ChatGPT v1 format: res.data.choices[0].message.content
      const data = res.data;
      let text = null;
      try {
        if (data && data.choices && data.choices[0] && data.choices[0].message && typeof data.choices[0].message.content === 'string') {
          text = data.choices[0].message.content.trim();
        } else if (typeof data === 'string') {
          text = data;
        } else if (data && typeof data.output === 'string') {
          text = data.output.trim();
        }
      } catch (err) {
        // fall through
      }

      // Update session counters (only on success)
      session.callsThisSession = (session.callsThisSession || 0) + 1;
      session.lastCallTimestamp = Date.now();
      window.__ai_session = session;

      // Optionally parse JSON if requested
      let parsed = null;
      if (options.parseJson === true && text) {
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          // parsing failed, return error but do not throw
          return { ok: false, error: { message: 'AI did not return valid JSON' }, data: { text }, usage: res.usage || null };
        }
      }

      // Return a consistent structured result
      return { ok: true, data: { text, json: parsed }, usage: res.usage || null };
    } catch (err) {
      return fallbackResult('Unexpected AI gateway error');
    }
  }

  // Expose globally
  window.callAI = callAI;
})();
