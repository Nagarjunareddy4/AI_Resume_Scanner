// exporter.js
// CSV export logic extracted from index.html

function exportToCSV() {
  if (currentData.length === 0) {
    showToast('No results to export', 'error');
    return;
  }

  const headers = ['Candidate Name', 'Job Title', 'Match Score (%)', 'Matched Skills', 'Missing Skills', 'Total Skills', 'Scan Date'];
  const rows = currentData.map(r => [
    r.candidate_name,
    r.job_title,
    r.match_score,
    r.matched_skills,
    r.missing_skills,
    r.total_skills,
    new Date(r.scan_date).toLocaleDateString()
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume_scan_results_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('CSV downloaded successfully!', 'success');
}

// Expose globally
window.exportToCSV = exportToCSV;