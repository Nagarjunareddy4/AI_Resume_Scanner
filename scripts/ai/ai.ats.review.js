// ai.ats.review.js
// AI helper to produce short explanations for ATS rule results

async function getAIATSReview(resumeText, atsRulesSummary, options = {}) {
  try {
    const cfg = window.aiConfig || {};
    if (!cfg.enabled) return [];

    const safeResume = typeof resumeText === 'string' ? resumeText.slice(0, 6000) : '';
    const safeSummary = typeof atsRulesSummary === 'string' ? atsRulesSummary.slice(0, 2000) : '';

    const prompt = window.aiPrompts.atsReviewPrompt(safeResume, safeSummary);

    const callOptions = {
      parseJson: true,
      maxResponseTokens: Math.min(150, cfg.maxResponseTokens || 512),
      model: cfg.model,
      useProxy: true,
      browserFallback: false
    };

    const res = await window.callAI(prompt, callOptions);
    if (!res || !res.ok) return [];

    const json = res.data && res.data.json ? res.data.json : null;
    if (json && Array.isArray(json.explanations)) {
      return json.explanations.slice(0, 3).map(s => (typeof s === 'string' ? s : String(s)));
    }

    if (res.data && res.data.text) {
      try {
        const parsed = JSON.parse(res.data.text);
        if (Array.isArray(parsed.explanations)) return parsed.explanations.slice(0, 3);
      } catch (err) {
        return [];
      }
    }

    return [];
  } catch (err) {
    return [];
  }
}

window.getAIATSReview = getAIATSReview;
