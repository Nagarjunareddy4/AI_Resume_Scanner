// upload.handler.js
// Upload handlers extracted from index.html

function setupDragDrop(dropZoneId, inputId, isMultiple = false) {
  const dropZone = document.getElementById(dropZoneId);
  const input = document.getElementById(inputId);

  dropZone.addEventListener('click', () => input.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    if (isMultiple) {
      handleResumeUpload(files);
    } else {
      handleJDUpload(files[0]);
    }
  });

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (isMultiple) {
      handleResumeUpload(files);
    } else {
      handleJDUpload(files[0]);
    }
  });
}

async function handleJDUpload(file) {
  if (!file) return;
  
  const fileType = file.name.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType);
  
  if (isImage) {
    showToast('Extracting text from image... This may take a moment', 'info');
  } else {
    showToast('Processing job description...', 'info');
  }
  
  jdFile = file;
  
  try {
    jdText = await readFile(file);
    
    const config = window.elementSdk ? window.elementSdk.config : currentThemeConfig;
    const primaryColor = config.primary_action_color || currentThemeConfig.primary_action_color;
    
    document.getElementById('jdFileName').innerHTML = `
      <span>📄 ${file.name}</span>
      <button onclick="deleteJD()" class="delete-btn px-3 py-1 rounded text-sm" style="background: #ef4444; color: white;">Remove</button>
    `;
    checkScanReady();
    showToast('Job description uploaded successfully', 'success');
  } catch (error) {
    showToast('Failed to read job description: ' + error.message, 'error');
    jdFile = null;
    jdText = '';
    checkScanReady();
  }
}

function deleteJD() {
  jdFile = null;
  jdText = '';
  document.getElementById('jdFileName').innerHTML = '';
  document.getElementById('jdInput').value = '';
  checkScanReady();
  showToast('Job description removed', 'info');
}

window.deleteJD = deleteJD;

function handleResumeUpload(files) {
  if (!files || files.length === 0) return;

  // 🧑 Candidate Mode: allow only ONE resume, no overwrite
  if (isCandidateMode) {
    if (resumeFiles.length > 0) {
      showToast(
        'Only one resume is allowed in Candidate Mode. Please remove the existing resume and upload again.',
        'error'
      );
      return;
    }

    // Allow first resume
    resumeFiles = [files[0]];
    renderResumeList();
    checkScanReady();
    showToast('Resume uploaded successfully', 'success');
    return;
  }

  // 👔 Recruiter Mode: APPEND resumes (do NOT overwrite)
  resumeFiles = resumeFiles.concat(files);

  renderResumeList();
  checkScanReady();
  showToast(`${files.length} resume(s) added successfully`, 'success');
}

function deleteResume(index) {
  resumeFiles.splice(index, 1);
  renderResumeList();
  checkScanReady();
  showToast('Resume removed', 'info');
  
  if (resumeFiles.length === 0) {
    document.getElementById('resumeInput').value = '';
    document.getElementById('resumeFileNames').textContent = '';
  }
}

window.deleteResume = deleteResume;