import tkinter as tk
from tkinter import filedialog, messagebox, ttk, simpledialog
import pandas as pd
from resume_matcher import extract_text_from_pdf, extract_text_from_docx, match_resumes_to_jd
import smtplib
from email.message import EmailMessage
import os

class ResumeScannerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Resume Scanner")
        self.root.geometry("880x580")
        self.root.configure(bg="#f0f2f5")

        self.jd_frame = tk.Frame(root, bg="#f0f2f5")
        self.jd_frame.pack(pady=10)

        tk.Label(self.jd_frame, text="Job Description", font=("Segoe UI", 10, "bold"), bg="#f0f2f5").pack()
        self.jd_text = tk.Text(self.jd_frame, height=8, width=100, font=("Segoe UI", 10))
        self.jd_text.pack(pady=5)
        
        btn_frame = tk.Frame(root, bg="#f0f2f5")
        btn_frame.pack(pady=5)
        tk.Button(btn_frame, text="Upload JD", command=self.upload_jd, bg="#0078D7", fg="white", padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Clear JD", command=lambda: self.jd_text.delete("1.0", tk.END), bg="#E81123", fg="white", padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Upload Resumes", command=self.upload_resumes, bg="#107C10", fg="white", padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Run Scanner", command=self.run_scanner, bg="#2D7D9A", fg="white", padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Download Results", command=self.open_download_window, bg="#6B46C1", fg="white", padx=10).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="Send Email", command=self.open_email_window, bg="#F7630C", fg="white", padx=10).pack(side=tk.LEFT, padx=5)

        self.tree = ttk.Treeview(root, columns=("Resume", "Score", "Skills"), show='headings', height=10)
        self.tree.heading("Resume", text="Resume")
        self.tree.heading("Score", text="Match Score (%)")
        self.tree.heading("Skills", text="Skills Found")
        self.tree.column("Resume", width=200)
        self.tree.column("Score", width=100)
        self.tree.column("Skills", width=350)
        self.tree.pack(pady=10, padx=10, fill="both", expand=True)

        self.results_df = pd.DataFrame()

    def upload_jd(self):
        path = filedialog.askopenfilename()
        if path.endswith(".txt"):
            with open(path, "r") as f:
                text = f.read()
        elif path.endswith(".pdf"):
            text = extract_text_from_pdf(path)
        elif path.endswith(".docx"):
            text = extract_text_from_docx(path)
        else:
            messagebox.showerror("Invalid File", "Upload txt, pdf or docx")
            return
        self.jd_text.delete("1.0", tk.END)
        self.jd_text.insert(tk.END, text)

    def upload_resumes(self):
        self.files = filedialog.askopenfilenames()
        if not self.files:
            messagebox.showwarning("No Files", "Please select resumes to upload.")

    def run_scanner(self):
        if not hasattr(self, 'files') or not self.files:
            messagebox.showwarning("No Resumes", "Upload resumes first.")
            return
        jd = self.jd_text.get("1.0", tk.END).strip()
        if not jd:
            messagebox.showwarning("Empty JD", "Please provide a job description.")
            return

        self.tree.delete(*self.tree.get_children())
        resume_texts = []
        filenames = []
        for file in self.files:
            if file.endswith(".pdf"):
                text = extract_text_from_pdf(file)
            elif file.endswith(".docx"):
                text = extract_text_from_docx(file)
            elif file.endswith(".txt"):
                with open(file, "r") as f:
                    text = f.read()
            else:
                continue
            resume_texts.append(text)
            filenames.append(os.path.basename(file))
        scores, skills = match_resumes_to_jd(resume_texts, jd)
        self.results_df = pd.DataFrame({
            "Resume": filenames,
            "Match Score (%)": [round(s*100, 2) for s in scores],
            "Skills Found": skills
        }).sort_values(by="Match Score (%)", ascending=False)
        for _, row in self.results_df.iterrows():
            self.tree.insert("", tk.END, values=(row["Resume"], row["Match Score (%)"], row["Skills Found"]))

    def open_download_window(self):
        if self.results_df.empty:
            messagebox.showwarning("No Results", "Run resume scan first.")
            return
        win = tk.Toplevel(self.root)
        win.title("Download Results")
        win.geometry("300x150")
        win.configure(bg="#e0e7ff")
        tk.Label(win, text="Click below to save CSV", bg="#e0e7ff", font=("Segoe UI", 10)).pack(pady=10)
        tk.Button(win, text="Save CSV", command=self.save_results, bg="#4CAF50", fg="white", padx=15).pack(pady=10)

    def save_results(self):
        if self.results_df.empty:
            return
        path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV Files", "*.csv")])
        if path:
            self.results_df.to_csv(path, index=False)
            messagebox.showinfo("Saved", f"Results saved to {path}")

    def open_email_window(self):
        if self.results_df.empty:
            messagebox.showwarning("No Results", "Run resume scan first.")
            return
        win = tk.Toplevel(self.root)
        win.title("Send Email")
        win.geometry("400x300")
        win.configure(bg="#fef3c7")

        tk.Label(win, text="Sender Gmail", bg="#fef3c7", font=("Segoe UI", 10)).pack(pady=5)
        sender_entry = tk.Entry(win, width=40)
        sender_entry.pack(pady=5)

        tk.Label(win, text="App Password", bg="#fef3c7", font=("Segoe UI", 10)).pack(pady=5)
        pw_frame = tk.Frame(win, bg="#fef3c7")
        pw_frame.pack(pady=5)
        password_entry = tk.Entry(pw_frame, width=30, show="*")
        password_entry.pack(side=tk.LEFT)
        def toggle_pw():
            password_entry.config(show="" if password_entry.cget("show") == "*" else "*")
        tk.Button(pw_frame, text="👁", command=toggle_pw, bg="#fef3c7", relief="flat").pack(side=tk.LEFT)

        tk.Label(win, text="Recipients (comma-separated)", bg="#fef3c7", font=("Segoe UI", 10)).pack(pady=5)
        to_entry = tk.Entry(win, width=40)
        to_entry.pack(pady=5)

        def send_email():
            sender = sender_entry.get()
            password = password_entry.get()
            recipients = [r.strip() for r in to_entry.get().split(",")]
            if not sender or not password or not recipients:
                messagebox.showerror("Missing", "Please fill all fields.")
                return
            msg = EmailMessage()
            msg["Subject"] = "Resume Match Results"
            msg["From"] = sender
            msg["To"] = recipients
            msg.set_content(self.results_df.to_string(index=False))
            try:
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                    smtp.login(sender, password)
                    smtp.send_message(msg)
                messagebox.showinfo("Success", "Email sent!")
                win.destroy()
            except Exception as e:
                messagebox.showerror("Failed", str(e))

        tk.Button(win, text="Send", command=send_email, bg="#0078D7", fg="white", padx=10).pack(pady=15)

if __name__ == "__main__":
    root = tk.Tk()
    app = ResumeScannerApp(root)
    root.mainloop()
