// matcher.js
// Matching & scoring logic extracted from index.html

function extractSkills(text) {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'express',
    'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes',
    'html', 'css', 'typescript', 'git', 'agile', 'scrum', 'rest api', 'graphql',
    'machine learning', 'ai', 'data analysis', 'excel', 'powerpoint', 'communication',
    'leadership', 'project management', 'teamwork', 'problem solving', 'spring boot',
    'django', 'flask', 'redis', 'jenkins', 'ci/cd', 'devops', 'linux', 'windows'
  ];
  
  const lowerText = text.toLowerCase();
  const foundSkills = commonSkills.filter(skill => 
    lowerText.includes(skill)
  );
  
  return foundSkills;
}

function calculateMatch(resumeText, jdSkills) {
  const lowerResume = resumeText.toLowerCase();
  const matchedSkills = jdSkills.filter(skill => lowerResume.includes(skill));
  const missingSkills = jdSkills.filter(skill => !lowerResume.includes(skill));
  const score = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;
  
  return { score, matchedSkills, missingSkills };
}

async function scanResumes() {
  // 🛑 VALIDATIONS
  // Make sure JD and resumes are uploaded
  if (!jdText || resumeFiles.length === 0) {
    showToast('Please upload both JD and resumes', 'error');
    return;
  }

  // 🚫 Candidate Mode: allow only ONE resume per scan
  if (isCandidateMode && resumeFiles.length > 1) {
    showToast('Candidate Mode allows only one resume per scan.', 'error');
    return;
  }

  // Ensure SDK is initialized
  if (!sdkInitialized || !window.dataSdk) {
    showToast('App is still initializing. Please wait a moment and try again.', 'error');
    return;
  }

  // 🔥 CLEAR OLD SCAN DATA (start fresh scan)
  currentData = [];
  localStorage.removeItem('resume_scanner_results');

  // Limit total scans to 999
  if (currentData.length + resumeFiles.length > 999) {
    showToast('Maximum limit of 999 scans reached. Please delete some results first.', 'error');
    return;
  }
  // 🚀 START SCANNING
  scanErrors = [];
  const scanBtn = document.getElementById('scanBtn');
  const btnText = document.getElementById('scanBtnText');
  const progressDiv = document.getElementById('scanProgress');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  scanBtn.disabled = true;
  progressDiv.classList.remove('hidden');
  btnText.textContent = 'Scanning...';

  showInlineWarning('⚠️ Do not refresh or close this window during scanning!');

  const jdSkills = extractSkills(jdText);
  const totalFiles = resumeFiles.length;
  let processedFiles = 0;
  
  for (const file of resumeFiles) {
    try {
      progressText.textContent = `Scanning ${file.name}... (${processedFiles + 1}/${totalFiles})`;
      
      const resumeText = await readFile(file);
      const { score, matchedSkills, missingSkills } = calculateMatch(resumeText, jdSkills);
      
      const result = await window.dataSdk.create({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        job_title: jdFile.name.replace(/\.[^/.]+$/, ""),
        candidate_name: file.name.replace(/\.[^/.]+$/, ""),
        resume_filename: file.name,
        match_score: score,
        matched_skills: matchedSkills.join(', '),
        missing_skills: missingSkills.join(', '),
        total_skills: jdSkills.length,
        scan_date: new Date().toISOString(),
        errors: ""
      });

      // ✅ ADD RESULT TO IN-MEMORY DATA FOR UI / EXPORT / EMAIL
      currentData.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        job_title: jdFile.name.replace(/\.[^/.]+$/, ""),
        candidate_name: file.name.replace(/\.[^/.]+$/, ""),
        resume_filename: file.name,
        match_score: score,
        matched_skills: matchedSkills.join(', '),
        missing_skills: missingSkills.join(', '),
        total_skills: jdSkills.length,
        scan_date: new Date().toISOString(),
        errors: ""
      });


      if (!result.isOk) {
        scanErrors.push({
          file: file.name,
          error: 'Failed to save scan result to database'
        });
      }
    } catch (error) {
      scanErrors.push({
        file: file.name,
        error: error.message || 'Unknown error during scanning'
      });
    }
    
    processedFiles++;
    const progress = (processedFiles / totalFiles) * 100;
    progressBar.style.width = `${progress}%`;
  }

  scanBtn.disabled = false;
  btnText.textContent = window.elementSdk ? window.elementSdk.config.scan_button_text || defaultConfig.scan_button_text : defaultConfig.scan_button_text;
  progressDiv.classList.add('hidden');
  progressBar.style.width = '0%';
  
  hideInlineWarning();

  if (scanErrors.length > 0) {
    showErrorBanner();
  }

  showToast('Scan completed!', 'success');
  showResultsModal();
}

// Expose core functions
window.extractSkills = extractSkills;
window.calculateMatch = calculateMatch;
window.scanResumes = scanResumes;