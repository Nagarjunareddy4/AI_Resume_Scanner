# 🚀 Resume Scanner – AI-Powered Resume Matching Tool

A modern, client-side **Resume Scanner** that matches resumes against a Job Description and provides **clear match scores, skill insights, and downloadable results**.

Designed with **two distinct user modes**:
- **Recruiter Mode** – bulk resume screening
- **Candidate Mode** – focused, single-resume feedback

No backend required. Fully browser-based.

---

## ✨ Key Features

### 🔍 Resume Scanning
- Upload **Job Description** (TXT, PDF, DOCX, Images)
- Upload **Resumes** (TXT, PDF, DOCX)
- Automatic text extraction using:
  - PDF.js
  - Mammoth (DOCX)
  - Tesseract OCR (Images)

---

### 🎯 Intelligent Skill Matching
- Extracts relevant skills from Job Description
- Compares resumes against JD skills
- Calculates:
  - Match Score (%)
  - Matched Skills
  - Missing Skills

---

## 🔄 Dual Mode System

### 👔 Recruiter Mode (Default)
- Allows **multiple resumes per scan**
- Designed for **bulk screening**
- Sorted results by match score
- Download all results as CSV

### 🧑 Candidate Mode
- Allows **only one resume per scan**
- Provides **personalized feedback**
- Highlights:
  - Skills you have
  - Skills to improve
  - Clear recommendations
- Ideal for candidates improving their resume

> Mode is controlled using a **single toggle**, with dynamic behavior and visual cues.

---

## 📥 Export Capabilities

- Download results as **CSV**
- CSV contains **only the current scan**
- No historic or duplicate data
- Ready for ATS uploads or offline analysis

---

## 🎨 UI & UX Highlights

- Light / Dark mode with auto-detection
- Smooth animations and progress indicators
- Drag-and-drop uploads
- Guided onboarding tour
- Responsive and accessible layout

---

## 🧹 Clean Data Handling (Major Achievement)

- Every scan starts **fresh**
- No historic data accumulation
- Prevents:
  - Duplicate results
  - Confusing exports
  - Storage bloat
- Ensures accuracy and consistency across:
  - Scan results
  - CSV export
  - Candidate feedback

---

## 🏆 Achievements & Improvements

✔ Clear separation of Recruiter and Candidate workflows  
✔ Eliminated duplicate and historic scan issues  
✔ Removed unnecessary email dependency  
✔ Simplified export pipeline (CSV-only)  
✔ Improved maintainability and readability  
✔ Fully GitHub Pages compatible  

---

## 🛠 Tech Stack

- **HTML5**
- **Tailwind CSS**
- **Vanilla JavaScript**
- **PDF.js**
- **Mammoth.js**
- **Tesseract.js**
- **LocalStorage (client-side data handling)**


