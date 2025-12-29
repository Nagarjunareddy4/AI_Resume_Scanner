// tour.js
// Extracted tour steps and controls from index.html

const tourSteps = [
  {
    element: 'modeToggle',
    title: 'Dark/Light Mode',
    description: 'Toggle between dark and light themes. Your preference will be saved for future visits!'
  },
  {
    element: 'candidateMode',
    title: 'Candidate Mode',
    description: 'Switch to Candidate Mode to get personalized feedback and suggestions on your resume!'
  },
  {
    element: 'jdDropZone',
    title: 'Upload Job Description',
    description: 'Upload the job description in .txt, .pdf, .docx, or even image formats. We\'ll extract the text!'
  },
  {
    element: 'resumeDropZone',
    title: 'Upload Resumes',
    description: 'Upload one or multiple resumes to scan against the job description. Drag & drop supported!'
  },
  {
    element: 'scanBtn',
    title: 'Scan Resumes',
    description: 'Click here to start the scanning process. Results are saved automatically!'
  }
];

let currentTourStep = 0;

function startTour() {
  // Only start if user hasn't completed the tour
  if (!localStorage.getItem('resume_scanner_tour_completed')) {
    // enable overlay interactions
    const overlay = document.getElementById('tourOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.style.pointerEvents = 'auto';
    }
    showTourStep(0);
  }
}

function showTourStep(stepIndex) {
  if (stepIndex >= tourSteps.length) {
    endTour();
    return;
  }

  currentTourStep = stepIndex;
  const step = tourSteps[stepIndex];
  const element = document.getElementById(step.element);
  
  if (!element) {
    showTourStep(stepIndex + 1);
    return;
  }

  const rect = element.getBoundingClientRect();
  const config = window.elementSdk ? window.elementSdk.config : currentThemeConfig;
  const surfaceColor = config.surface_color || currentThemeConfig.surface_color;
  const textColor = config.text_color || currentThemeConfig.text_color;
  const primaryColor = config.primary_action_color || currentThemeConfig.primary_action_color;
  
  const overlay = document.getElementById('tourOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.style.pointerEvents = 'auto';
  }
  
  const spotlight = document.getElementById('tourSpotlight');
  spotlight.style.left = `${rect.left - 8}px`;
  spotlight.style.top = `${rect.top - 8}px`;
  spotlight.style.width = `${rect.width + 16}px`;
  spotlight.style.height = `${rect.height + 16}px`;

  const tooltip = document.getElementById('tourTooltip');
  tooltip.style.background = surfaceColor;
  tooltip.innerHTML = `
    <h3 class="text-xl font-bold mb-2" style="color: ${textColor};">${step.title}</h3>
    <p class="mb-4" style="color: ${textColor};">${step.description}</p>
    <div class="flex justify-between items-center">
      <span class="text-sm" style="color: ${textColor};">Step ${stepIndex + 1} of ${tourSteps.length}</span>
      <div class="flex gap-2">
        <button onclick="skipTour()" class="px-4 py-2 rounded font-medium" style="background: #64748b; color: white;">Skip</button>
        <button onclick="nextTourStep()" class="px-4 py-2 rounded font-medium" style="background: ${primaryColor}; color: white;">
          ${stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  `;

  // position tooltip; prefer below, but if it overflows viewport place above
  const tooltipTopDefault = rect.bottom + 20;
  const tooltipLeftDefault = rect.left;
  // measure tooltip (after content set)
  const tooltipRect = tooltip.getBoundingClientRect();
  let tooltipTop = tooltipTopDefault;
  // if tooltip bottom would overflow viewport, place it above the element
  if (tooltipTop + tooltipRect.height > window.innerHeight - 20) {
    tooltipTop = rect.top - tooltipRect.height - 20;
    if (tooltipTop < 20) tooltipTop = 20;
  }
  // keep tooltip within horizontal bounds with 20px padding
  const tooltipLeft = Math.max(20, Math.min(window.innerWidth - tooltipRect.width - 20, tooltipLeftDefault));
  tooltip.style.top = `${tooltipTop}px`;
  tooltip.style.left = `${tooltipLeft}px`;
}

function nextTourStep() {
  showTourStep(currentTourStep + 1);
}

function skipTour() {
  endTour();
}

function endTour() {
  const overlay = document.getElementById('tourOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.pointerEvents = 'none';
  }
  localStorage.setItem('resume_scanner_tour_completed', 'true');
  showToast('Tour completed! Enjoy using AI Resume Scanner!', 'success');
}

// Ensure overlay is non-blocking by default
(function initTourOverlay() {
  const overlay = document.getElementById('tourOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.pointerEvents = 'none';
  }
})();

// Expose globally for inline onclicks and other modules that reference them
window.startTour = startTour;
window.showTourStep = showTourStep;
window.nextTourStep = nextTourStep;
window.skipTour = skipTour;
window.endTour = endTour;