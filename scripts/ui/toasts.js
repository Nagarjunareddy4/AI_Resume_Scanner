// toasts.js
// showToast and inline warning helpers extracted from index.html

function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderLeft = `4px solid ${colors[type]}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

function showInlineWarning(message) {
  const existingWarning = document.getElementById('inlineWarning');
  if (existingWarning) existingWarning.remove();

  const warning = document.createElement('div');
  warning.id = 'inlineWarning';
  warning.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
  warning.textContent = message;
  document.body.appendChild(warning);
}

function hideInlineWarning() {
  const warning = document.getElementById('inlineWarning');
  if (warning) warning.remove();
}

// Expose globally
window.showToast = showToast;
window.showInlineWarning = showInlineWarning;
window.hideInlineWarning = hideInlineWarning;