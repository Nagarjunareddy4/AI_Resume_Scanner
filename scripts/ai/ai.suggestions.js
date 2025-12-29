// ai.suggestions.js
// Provide AI-powered resume improvement suggestions (Candidate Mode)

async function getAISuggestions(resumeText, missingSkills, jobDescription, options = {}) {
  try {
    const cfg = window.aiConfig || {};
    if (!cfg.enabled) return { suggestions: {}, section_recommendations: [] };

    // Basic privacy: do not send very large documents; truncate to reasonable size
    const safeResume = typeof resumeText === 'string' ? resumeText.slice(0, 8000) : '';
    const safeJD = typeof jobDescription === 'string' ? jobDescription.slice(0, 4000) : '';

    const prompt = window.aiPrompts.resumeImprovementPrompt(safeResume, missingSkills || [], safeJD);

    const callOptions = {
      parseJson: true,
      maxResponseTokens: Math.min(200, cfg.maxResponseTokens || 512),
      model: cfg.model,
      useProxy: true,
      browserFallback: false,
      // do not pass API key here - gateway will check proxy or fallback config
    };

    const res = await window.callAI(prompt, callOptions);
    if (!res || !res.ok) return { suggestions: {}, section_recommendations: [] };

    // If parsed JSON exists, use it, otherwise attempt to parse text
    const json = (res.data && res.data.json) ? res.data.json : null;
    if (json && typeof json === 'object') {
      // ensure expected shape
      return {
        suggestions: json.suggestions && typeof json.suggestions === 'object' ? json.suggestions : {},
        section_recommendations: Array.isArray(json.section_recommendations) ? json.section_recommendations : []
      };
    }

    // Fallback: attempt to extract JSON from text
    if (res.data && res.data.text) {
      try {
        const parsed = JSON.parse(res.data.text);
        return {
          suggestions: parsed.suggestions && typeof parsed.suggestions === 'object' ? parsed.suggestions : {},
          section_recommendations: Array.isArray(parsed.section_recommendations) ? parsed.section_recommendations : []
        };
      } catch (err) {
        return { suggestions: {}, section_recommendations: [] };
      }
    }

    return { suggestions: {}, section_recommendations: [] };
  } catch (err) {
    return { suggestions: {}, section_recommendations: [] };
  }
}

window.getAISuggestions = getAISuggestions;
