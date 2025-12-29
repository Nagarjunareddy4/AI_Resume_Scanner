// mode.manager.js
// Mode management and theme helpers extracted from index.html

function detectTheme() {
  const savedTheme = localStorage.getItem('resume_scanner_theme');
  if (savedTheme) {
    isDarkMode = savedTheme === 'dark';
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode = prefersDark;
  }
  applyTheme();
}

function applyTheme() {
  const baseTheme = isDarkMode ? { ...defaultConfig, ...darkModeConfig } : { ...defaultConfig };
  
  if (window.elementSdk && window.elementSdk.config) {
    const hasCustomColors = window.elementSdk.config.background_color !== undefined;
    
    if (hasCustomColors) {
      currentThemeConfig = { ...baseTheme, ...window.elementSdk.config };
    } else {
      currentThemeConfig = baseTheme;
    }
  } else {
    currentThemeConfig = baseTheme;
  }
  
  onConfigChange(currentThemeConfig);
  updateModeIcon();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('resume_scanner_theme', isDarkMode ? 'dark' : 'light');
  applyTheme();
}

function applyModeStyles() {
  const scanBtn = document.getElementById('scanBtn');
  const subtitle = document.getElementById('subtitle');
  const label = document.getElementById('candidateModeLabel');

  if (isCandidateMode) {
    // 🧑‍💼 Candidate Mode
    scanBtn.style.background = '#22c55e'; // green
    subtitle.textContent = 'Personal Resume Feedback';
    label.textContent = 'Candidate Mode';
  } else {
    // 🧑‍💼 Recruiter Mode
    scanBtn.style.background = currentThemeConfig.primary_action_color;
    subtitle.textContent = 'AI-Powered Resume Matching';
    label.textContent = 'Recruiter Mode';
  }
}

function updateModeIcon() {
  const icon = document.getElementById('modeIcon');
  if (isDarkMode) {
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
  } else {
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
  }
}

// Expose theme/mode manipulators globally
window.detectTheme = detectTheme;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.applyModeStyles = applyModeStyles;
window.updateModeIcon = updateModeIcon;