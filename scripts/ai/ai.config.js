// ai.config.js
// Centralized AI feature configuration

// Feature flags and usage limits. Keep conservative defaults for cost control.
const aiConfig = {
  enabled: false, // globally disable all AI features unless explicitly enabled
  requireApiKey: true, // AI disabled if OpenAI key is missing

  // Feature flags (enable specific features independently)
  features: {
    suggestions: true, // AI resume improvement suggestions (candidate mode)
    atsReview: true, // AI explanations for ATS rules
    explainScore: true // AI explanation for match scores
  },

  // Free usage: per-session limits (short-lived session counters)
  freeCallsPerSession: 2, // free users can make up to 2 AI calls per session

  // Free usage: per-browser quota (persistent, refresh-resistant)
  freeCallsPerDay: 2, // number of free calls allowed per browser within the quota window
  quotaResetHours: 24, // how long the quota window lasts (hours)
  quotaStorageKey: 'ai_quota_v1', // localStorage key to persist quota metadata

  // Model selection (cost-efficient)
  model: 'gpt-3.5-turbo',
  maxResponseTokens: 512, // soft token limit for responses
  maxPromptTokens: 1024,  // soft token limit for prompt

  // Rate limiting (simple): min ms between calls
  minMsBetweenCalls: 500, // very small throttle to avoid accidental spamming

  // Proxy and fallback controls
  proxyEndpoint: null, // set to your server proxy endpoint to keep API keys safe
  browserFallback: false, // allow browser fetch if explicitly enabled for dev

  // Safety & privacy defaults
  persistResponses: false, // do NOT store responses by default
  logResponses: false // do NOT log resume or sensitive content
};

// Expose config globally for other AI modules
window.aiConfig = aiConfig;

// Helper: runtime session counters (in-memory only)
window.__ai_session = {
  callsThisSession: 0,
  lastCallTimestamp: 0
};
