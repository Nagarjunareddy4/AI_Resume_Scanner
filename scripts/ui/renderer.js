// renderer.js
// UI rendering helpers extracted from index.html

function showResultsModal() {
  const modal = document.getElementById('resultsModal');
  const content = document.getElementById('modalContent');
  
  if (isCandidateMode) {
    renderCandidateSuggestions(content);
  } else {
    renderAllResults(content);
  }
  
  modal.classList.remove('hidden');
}

function renderCandidateSuggestions(container) {
  if (currentData.length === 0) return;

  const latestScan = currentData[currentData.length - 1];
  const config = window.elementSdk ? window.elementSdk.config : currentThemeConfig;
  const surfaceColor = config.surface_color || currentThemeConfig.surface_color;
  const textColor = config.text_color || currentThemeConfig.text_color;
  const primaryColor = config.primary_action_color || currentThemeConfig.primary_action_color;
  const secondaryColor = config.secondary_action_color || currentThemeConfig.secondary_action_color;
  const scoreColor = latestScan.match_score >= 70 ? '#22c55e' : latestScan.match_score >= 40 ? '#f59e0b' : '#ef4444';

  const missingSkills = latestScan.missing_skills ? latestScan.missing_skills.split(', ').filter(s => s) : [];
  const matchedSkills = latestScan.matched_skills ? latestScan.matched_skills.split(', ').filter(s => s) : [];

  container.innerHTML = `
    <div class="p-6 rounded-xl shadow-lg mb-6" style="background: ${surfaceColor};">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-2xl font-bold" style="color: ${textColor};">Your Match Score</h3>
          <p class="text-sm" style="color: ${secondaryColor};">Based on: ${latestScan.job_title}</p>
        </div>
        <div class="text-5xl font-bold" style="color: ${scoreColor};">${latestScan.match_score}%</div>
      </div>
      <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div class="progress-bar h-full rounded-full" style="width: ${latestScan.match_score}%; background: ${scoreColor};"></div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="suggestion-card p-6 rounded-xl shadow-lg" style="background: ${surfaceColor};">
        <h4 class="text-xl font-bold mb-3" style="color: ${textColor};">✅ Skills You Have (${matchedSkills.length})</h4>
        <div class="flex flex-wrap gap-2">
          ${matchedSkills.map(skill => `
            <span class="px-3 py-1 rounded-full text-sm font-medium" style="background: ${primaryColor}20; color: ${primaryColor};">
              ${skill}
            </span>
          `).join('')}
        </div>
      </div>

      ${missingSkills.length > 0 ? `
        <div class="suggestion-card p-6 rounded-xl shadow-lg" style="background: ${surfaceColor}; border-left-color: ${scoreColor};">
          <h4 class="text-xl font-bold mb-3" style="color: ${textColor};">🎯 Skills to Add (${missingSkills.length})</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            ${missingSkills.map(skill => `
              <span class="px-3 py-1 rounded-full text-sm font-medium" style="background: ${scoreColor}20; color: ${scoreColor};">
                ${skill}
              </span>
            `).join('')}
          </div>
          <div class="mt-4 p-4 rounded-lg" style="background: ${primaryColor}10;">
            <p class="font-medium mb-2" style="color: ${textColor};">💡 Recommendations:</p>
            <ul class="space-y-2 text-sm" style="color: ${secondaryColor};">
              <li>• Add these skills to your resume if you have experience with them</li>
              <li>• Consider taking online courses to learn these in-demand skills</li>
              <li>• Update your projects section to highlight relevant experience</li>
              <li>• Use exact keywords from the job description</li>
            </ul>
          </div>
        </div>
      ` : `
        <div class="p-6 rounded-xl shadow-lg text-center" style="background: ${surfaceColor};">
          <div class="text-5xl mb-3">🎉</div>
          <h4 class="text-2xl font-bold mb-2" style="color: ${textColor};">Perfect Match!</h4>
          <p style="color: ${secondaryColor};">Your resume contains all the required skills for this position.</p>
        </div>
      `}
    </div>
  `;
}

function renderAllResults(container) {
  const sortedData = [...currentData].sort((a, b) => b.match_score - a.match_score);
  const config = window.elementSdk ? window.elementSdk.config : currentThemeConfig;
  const surfaceColor = config.surface_color || currentThemeConfig.surface_color;
  const textColor = config.text_color || currentThemeConfig.text_color;
  const secondaryColor = config.secondary_action_color || currentThemeConfig.secondary_action_color;

  container.innerHTML = `
    <div class="space-y-4 max-h-96 overflow-y-auto">
      ${sortedData.map(result => {
        const scoreColor = result.match_score >= 70 ? '#22c55e' : result.match_score >= 40 ? '#f59e0b' : '#ef4444';
        
        return `
          <div class="p-6 rounded-xl shadow-lg" style="background: ${surfaceColor};">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold" style="color: ${textColor};">${result.candidate_name}</h3>
                <p class="text-sm" style="color: ${secondaryColor};">Job: ${result.job_title}</p>
                <p class="text-xs" style="color: ${secondaryColor};">${new Date(result.scan_date).toLocaleDateString()}</p>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold" style="color: ${scoreColor};">${result.match_score}%</div>
                <div class="text-sm" style="color: ${secondaryColor};">Match Score</div>
              </div>
            </div>
            <div class="mb-3">
              <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="progress-bar h-full rounded-full" style="width: ${result.match_score}%; background: ${scoreColor};"></div>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium mb-1" style="color: ${textColor};">Matched Skills:</p>
              <p class="text-sm" style="color: ${secondaryColor};">${result.matched_skills || 'None'}</p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderResumeList() {
  const config = window.elementSdk ? window.elementSdk.config : currentThemeConfig;
  const textColor = config.text_color || currentThemeConfig.text_color;
  const surfaceColor = config.surface_color || currentThemeConfig.surface_color;
  
  const container = document.getElementById('resumeFilesList');
  container.innerHTML = resumeFiles.map((file, index) => `
    <div class="flex justify-between items-center p-3 rounded-lg" style="background: ${surfaceColor};">
      <span class="text-sm" style="color: ${textColor};">📄 ${file.name}</span>
      <button onclick="deleteResume(${index})" class="delete-btn px-3 py-1 rounded text-sm" style="background: #ef4444; color: white;">Remove</button>
    </div>
  `).join('');

  document.getElementById('resumeFileNames').textContent = `${resumeFiles.length} file(s) selected`;
}

function showErrorBanner() {
  const banner = document.getElementById('errorBanner');
  const content = document.getElementById('errorContent');
  
  content.innerHTML = `
    <p class="mb-2">The following errors occurred during scanning:</p>
    <ul class="list-disc list-inside space-y-1">
      ${scanErrors.map(err => `
        <li><strong>${err.file}:</strong> ${err.error}</li>
      `).join('')}
    </ul>
    <p class="mt-3 text-sm">💡 Suggestions:</p>
    <ul class="list-disc list-inside text-sm mt-1">
      <li>Ensure files are not corrupted or password-protected</li>
      <li>Try converting PDF files to a different format</li>
      <li>For images, ensure text is clear and readable</li>
      <li>Check that files are properly formatted documents</li>
    </ul>
  `;
  
  banner.classList.remove('hidden');
}

// Expose needed functions globally
window.showResultsModal = showResultsModal;
window.renderResumeList = renderResumeList;
window.showErrorBanner = showErrorBanner;