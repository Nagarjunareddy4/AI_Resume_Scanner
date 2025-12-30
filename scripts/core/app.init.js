// app.init.js
// App initialization, config, SDK adapter and boot sequence extracted from index.html

const defaultConfig = {
  background_color: "#f0f4f8",
  surface_color: "#ffffff",
  text_color: "#1e293b",
  primary_action_color: "#3b82f6",
  secondary_action_color: "#64748b",
  font_family: "system-ui",
  font_size: 16,
  app_title: "AI Resume Scanner",
  subtitle: "AI-Powered Resume Matching",
  jd_upload_label: "Upload Job Description",
  resume_upload_label: "Upload Resumes",
  scan_button_text: "Scan Resumes",
  candidate_mode_label: "Candidate Mode",
  results_title: "Scan Results",
  export_button_text: "Download CSV",
  tour_welcome_title: "Welcome to AI Resume Scanner!",
  tour_welcome_message: "Let's take a quick tour of the features"
};

const darkModeConfig = {
  background_color: "#0f172a",
  surface_color: "#1e293b",
  text_color: "#f1f5f9",
  primary_action_color: "#3b82f6",
  secondary_action_color: "#94a3b8"
};

let isDarkMode = false;
let currentThemeConfig = { ...defaultConfig };

let currentData = [];
let jdFile = null;
let resumeFiles = [];
let jdText = '';
let isCandidateMode = false;
let scanErrors = [];

// Expose a simple currentMode string for AI gating and other consumers
window.currentMode = isCandidateMode ? 'candidate' : 'recruiter';

const dataHandler = {
  onDataChanged(data) {
    currentData = data;
  }
};

let sdkInitialized = false;
// ===== Local Data SDK Adapter (GitHub Pages compatible) =====
(function () {
  if (window.dataSdk) return; // do not override real SDK

  const STORAGE_KEY = 'resume_scanner_results';

  function load() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  window.dataSdk = {
    async init(handler) {
      const data = load();
      if (handler && typeof handler.onDataChanged === 'function') {
        handler.onDataChanged(data);
      }
      return { isOk: true };
    },

    async create(record) {
      const data = load();
      data.push(record);
      save(data);
      return { isOk: true };
    }
  };
})();

async function initApp() {
  let retries = 0;
  const maxRetries = 100;
  
  while (!window.dataSdk && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!window.dataSdk) {
    console.error('Data SDK failed to load after 10 seconds');
    sdkInitialized = false;
    return;
  }
  
  try {
    const initResult = await window.dataSdk.init(dataHandler);
    if (!initResult.isOk) {
      console.error('Failed to initialize Data SDK');
      sdkInitialized = false;
    } else {
      sdkInitialized = true;
      checkScanReady();
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    sdkInitialized = false;
  }
}

function showPrivacyGateIfNeeded() {
  const hasAccepted = localStorage.getItem('resume_scanner_privacy_accepted');
  if (!hasAccepted) {
    document.getElementById('privacyGate').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent scrolling
  }
}

function closePrivacyGate() {
  localStorage.setItem('resume_scanner_privacy_accepted', 'true');
  document.getElementById('privacyGate').classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('acceptPrivacyGate')
  .addEventListener('click', closePrivacyGate);


async function onConfigChange(config) {
  const customFont = config.font_family || currentThemeConfig.font_family || defaultConfig.font_family;
  const baseSize = config.font_size || currentThemeConfig.font_size || defaultConfig.font_size;
  const baseFontStack = 'system-ui, -apple-system, sans-serif';
  const fontFamily = `${customFont}, ${baseFontStack}`;

  const bgColor = config.background_color || currentThemeConfig.background_color;
  const surfaceColor = config.surface_color || currentThemeConfig.surface_color;
  const textColor = config.text_color || currentThemeConfig.text_color;
  const primaryColor = config.primary_action_color || currentThemeConfig.primary_action_color;
  const secondaryColor = config.secondary_action_color || currentThemeConfig.secondary_action_color;

  document.getElementById('app').style.background = bgColor;
  document.getElementById('app').style.color = textColor;
  document.getElementById('app').style.fontFamily = fontFamily;
  document.getElementById('app').style.fontSize = `${baseSize}px`;

  document.getElementById('appTitle').textContent = config.app_title || defaultConfig.app_title;
  document.getElementById('appTitle').style.fontSize = `${baseSize * 2}px`;
  document.getElementById('appTitle').style.color = textColor;

  document.getElementById('subtitle').textContent = config.subtitle || defaultConfig.subtitle;
  document.getElementById('subtitle').style.fontSize = `${baseSize * 1.25}px`;
  document.getElementById('subtitle').style.color = secondaryColor;

  document.getElementById('jdUploadLabel').textContent = config.jd_upload_label || defaultConfig.jd_upload_label;
  document.getElementById('jdUploadLabel').style.fontSize = `${baseSize * 1.5}px`;
  document.getElementById('jdUploadLabel').style.color = textColor;

  document.getElementById('resumeUploadLabel').textContent = config.resume_upload_label || defaultConfig.resume_upload_label;
  document.getElementById('resumeUploadLabel').style.fontSize = `${baseSize * 1.5}px`;
  document.getElementById('resumeUploadLabel').style.color = textColor;

  document.getElementById('scanBtnText').textContent = config.scan_button_text || defaultConfig.scan_button_text;
  document.getElementById('exportBtnText').textContent = config.export_button_text || defaultConfig.export_button_text;

  document.getElementById('candidateModeLabel').textContent = config.candidate_mode_label || defaultConfig.candidate_mode_label;
  document.getElementById('candidateModeLabel').style.color = textColor;

  document.querySelectorAll('.upload-zone').forEach(zone => {
    zone.parentElement.style.background = surfaceColor;
    zone.style.color = textColor;
  });

  document.getElementById('scanBtn').style.background = primaryColor;
  document.getElementById('scanBtn').style.color = surfaceColor;
  document.getElementById('scanBtn').style.fontSize = `${baseSize * 1.125}px`;

  document.getElementById('exportBtnModal').style.background = secondaryColor;
  document.getElementById('exportBtnModal').style.color = surfaceColor;

  const modalContent = document.querySelector('.modal-backdrop + div');
  if (modalContent) {
    modalContent.style.background = surfaceColor;
    modalContent.style.color = textColor;
  }

  const resultsModalContent = document.querySelector('.results-modal');
  if (resultsModalContent) {
    resultsModalContent.style.background = surfaceColor;
    resultsModalContent.style.color = textColor;
  }


  document.getElementById('modeToggle').style.background = surfaceColor;
  document.getElementById('modeToggle').style.color = textColor;

  document.getElementById('tourBtn').style.background = primaryColor;
  document.getElementById('tourBtn').style.color = surfaceColor;

  document.getElementById('progressText').style.color = textColor;
  document.getElementById('scanProgress').style.color = textColor;
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
        { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
        { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
        { get: () => config.primary_action_color || defaultConfig.primary_action_color, set: (v) => { config.primary_action_color = v; window.elementSdk.setConfig({ primary_action_color: v }); } },
        { get: () => config.secondary_action_color || defaultConfig.secondary_action_color, set: (v) => { config.secondary_action_color = v; window.elementSdk.setConfig({ secondary_action_color: v }); } }
      ],
      borderables: [],
      fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
      fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } }
    }),
    mapToEditPanelValues: (config) => new Map([
      ["app_title", config.app_title || defaultConfig.app_title],
      ["subtitle", config.subtitle || defaultConfig.subtitle],
      ["jd_upload_label", config.jd_upload_label || defaultConfig.jd_upload_label],
      ["resume_upload_label", config.resume_upload_label || defaultConfig.resume_upload_label],
      ["scan_button_text", config.scan_button_text || defaultConfig.scan_button_text],
      ["candidate_mode_label", config.candidate_mode_label || defaultConfig.candidate_mode_label],
      ["results_title", config.results_title || defaultConfig.results_title],
      ["export_button_text", config.export_button_text || defaultConfig.export_button_text],
      ["tour_welcome_title", config.tour_welcome_title || defaultConfig.tour_welcome_title],
      ["tour_welcome_message", config.tour_welcome_message || defaultConfig.tour_welcome_message]
    ])
  });
}

// Wire up DOM event bindings that rely on helpers in other modules
setupDragDrop('jdDropZone', 'jdInput', false);
setupDragDrop('resumeDropZone', 'resumeInput', true);

document.getElementById('scanBtn').addEventListener('click', scanResumes);
document.getElementById('exportBtnModal').addEventListener('click', exportToCSV);
document.getElementById('modeToggle').addEventListener('click', toggleTheme);
document.getElementById('tourBtn').addEventListener('click', () => showTourStep(0));
document.getElementById('closeResultsBtn').addEventListener('click', () => {
  document.getElementById('resultsModal').classList.add('hidden');
});
document.getElementById('resultsBackdrop').addEventListener('click', () => {
  document.getElementById('resultsModal').classList.add('hidden');
});
document.getElementById('closeErrorBtn').addEventListener('click', () => {
  document.getElementById('errorBanner').classList.add('hidden');
});

document.getElementById('candidateMode').addEventListener('change', (e) => {
  isCandidateMode = e.target.checked;
  window.currentMode = isCandidateMode ? 'candidate' : 'recruiter';
  applyModeStyles();
});

function checkScanReady() {
  const scanBtn = document.getElementById('scanBtn');
  scanBtn.disabled = !(jdFile && jdText && resumeFiles.length > 0);
}

// Initial boot
detectTheme();
initApp();
applyModeStyles();
showPrivacyGateIfNeeded();

// Note: auto-start of tour on load was intentionally removed per refactor rules

// Expose some state for debugging if needed (do not rename existing symbols)
window.initApp = initApp;
window.onConfigChange = onConfigChange;
window.checkScanReady = checkScanReady;