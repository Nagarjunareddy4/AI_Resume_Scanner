**💼 AI-Powered Resume Scanner**

An intelligent resume screening application built with Python that allows recruiters to automatically match resumes with job descriptions and helps candidates understand how well their resume aligns with a job.

**🚀 Features**

Upload job descriptions (.txt, .pdf, .docx)

Upload multiple resumes and view matching scores

Automatically extracts key skills from JD and matches with resume content

Displays score with colored progress bars

Modern GUI with enhanced layout and theme

Download match results as .csv

Send results via Gmail SMTP with secure login (show/hide password)

Multi-email support for recruiters

**👨‍💼 For Recruiters**

How to Use:

Run the app.

Upload your Job Description (JD).
Upload one or more candidate resumes
View match scores and extracted skills instantly.
Click on Download Results or Send Email to get/share the results.

In the email window:
Enter your Gmail address & password.
Add one or more recipient emails.
Send scores and matched details.

**🧑‍💻 For Candidates**

Why Use:

Check how well your resume aligns with any job.
Get a skill-based match score.
Identify missing skills and keywords.
Improve your resume for better visibility.

**🛠️ Installation**

Prerequisites:

```bash
Python 3.8 or higher
```
**Install required packages:**

```bash
pip install -r requirements.txt
```
Make sure to download the spaCy model:
```bash
python -m spacy download en_core_web_sm
```
**🖥️ Run the Application**

```
python gui_final_refined.py
```
To create a .exe:
```
pyinstaller --onefile --windowed gui_final_refined.py
```
**✉️ Email Sending Setup**

Uses Gmail SMTP. You must enable “Less secure app access” or use an App Password.

Steps:

Enter sender email and password.
Add recipient emails (comma-separated).
Click Send.

**🧪 Sample Test Files**

Place .pdf, .docx, or .txt resumes in /sample_resumes
Place a job description file in /sample_jd

**🎨 Screenshots**

Upload Section	Results View	Email Sender

**🧑‍🤝‍🧑 Contributing**

1. Fork this repo.
2. Create your feature branch:
```
git checkout -b feature/YourFeature
```
3. Commit your changes.
4. Push and create a PR.

