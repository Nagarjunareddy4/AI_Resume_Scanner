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
python gui.py
```
To create a .exe:
```
pip install pyinstaller
pyinstaller --onefile --windowed --exclude-module tensorflow gui.py
```
If you facing any issue while creating exe file, you can run below
```
pyinstaller --onefile --exclude-module tensorflow "--add-data=/users/nagar/appdata/local/packages/pythonsoftwarefoundation.python.3.10_qbz5n2kfra8p0/localcache/local-packages/python310/site-packages/en_core_web_sm:en_core_web_sm" gui.py
```
You could try to include the entire spacy directory using --add-data. This would make your executable larger but might resolve the issue.
```
pyinstaller --onefile --exclude-module tensorflow --add-data "your_python_environment/lib/site-packages/spacy:spacy" your_gui_script.py
```
How do you find the path?
Open your terminal, Run the following command
```
pip show en_core_web_sm
```
For example, if the "Location:" is /your/python/env/lib/site-packages, then the path you'd use with --add-data would likely be /your/python/env/lib/site-packages/en_core_web_sm
After that you need to provide source and destination paths like below
```
pyinstaller --onefile --exclude-module tensorflow --add-data="/path/to/your/site-packages/en_core_web_sm:en_core_web_sm" your_gui_script.py
```
This way you can fix your issue

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

