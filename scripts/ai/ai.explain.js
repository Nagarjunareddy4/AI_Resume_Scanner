// ai.explain.js
// Provide plain-English explanation for match scores

async function getAIScoreExplanation(matchScore, skillMatchPercent, atsScore, options = {}) {
  try {
    const cfg = window.aiConfig || {};
    if (!cfg.enabled || window.currentMode !== 'candidate') return '';

    const prompt = window.aiPrompts.explainScorePrompt(matchScore, skillMatchPercent, atsScore);

    const callOptions = {
      parseJson: true,
      maxResponseTokens: Math.min(120, cfg.maxResponseTokens || 512),
      model: cfg.model,
      useProxy: true,
      browserFallback: false
    };

    const res = await window.callAI(prompt, callOptions);
    if (!res || !res.ok) return '';

    const json = res.data && res.data.json ? res.data.json : null;
    if (json && typeof json.explanation === 'string') return json.explanation;

    if (res.data && res.data.text) {
      try {
        const parsed = JSON.parse(res.data.text);
        if (parsed && typeof parsed.explanation === 'string') return parsed.explanation;
        // If not JSON, fall back to raw text
        return String(res.data.text).slice(0, 400);
      } catch (err) {
        return String(res.data.text).slice(0, 400);
      }
    }

    return '';
  } catch (err) {
    return '';
  }
}

window.getAIScoreExplanation = getAIScoreExplanation;
