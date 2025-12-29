// ai.prompts.js
// Deterministic, JSON-only prompt templates. Prompts instruct the model to output JSON only

function resumeImprovementPrompt(resumeText, missingSkills, jobDescription) {
  const skillsList = Array.isArray(missingSkills) ? missingSkills.join(', ') : (missingSkills || '');
  return `You are an assistant that suggests short, factual resume bullet points for missing skills. Do not invent experience. Output JSON only with keys: "suggestions" (object where keys are skills and values are arrays of short bullets), and "section_recommendations" (array of short strings). Resume: """${resumeText}"""; Missing skills: "${skillsList}"; Job description: """${jobDescription}""".`;
}

function atsReviewPrompt(resumeText, atsRulesSummary) {
  return `You are an assistant that provides brief explanations for ATS rule results. Do not invent experience. Output JSON only with key "explanations" containing an array of up to 3 short strings. Resume: """${resumeText}"""; ATS rules summary: """${atsRulesSummary}""".`;
}

function explainScorePrompt(matchScore, skillMatchPercent, atsScore) {
  return `You are an assistant that explains why a match score is a particular value. Do not change any scores or invent data. Output JSON only with key "explanation" containing a single short string. Inputs: match_score: ${matchScore}, skill_match_percent: ${skillMatchPercent}, ats_score: ${atsScore}.`;
}

window.aiPrompts = {
  resumeImprovementPrompt,
  atsReviewPrompt,
  explainScorePrompt
};
