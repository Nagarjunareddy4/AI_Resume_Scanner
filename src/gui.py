
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import pandas as pd
from resume_matcher import (
    extract_text_from_pdf,
    extract_text_from_docx,
    match_resumes_to_jd,
    extract_skills_from_text
)


class ResumeScannerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Resume Scanner")
        self.root.configure(bg="#f3f7fc")
        self.root.geometry("1000x700")
        
        self.jd_text = ""
        self.resume_texts = []
        self.filenames = []
        
        self.setup_ui()

    def setup_ui(self):
        # Progress bar
        self.progress = ttk.Progressbar(self.root, orient="horizontal", length=300, mode="determinate")
        self.progress.pack(pady=10)
        self.progress_label = tk.Label(self.root, text="Scan Results Preview:", bg="#f3f7fc")
        self.progress_label.pack()

        # Table
        columns = ("Resume", "Match Score (%)", "Skills Found")
        self.tree = ttk.Treeview(self.root, columns=columns, show="headings", height=6)
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, anchor="center")
        self.tree.pack(pady=5)

        # Section title
        tk.Label(self.root, text="AI-Powered Resume Scanner", font=("Arial", 16, "bold"), bg="#f3f7fc").pack(pady=10)

        # JD section
        tk.Label(self.root, text="Job Description (Paste or Upload):", bg="#f3f7fc").pack()
        self.jd_text_box = tk.Text(self.root, height=10, width=80)
        self.jd_text_box.pack(pady=5)
        
        jd_btn_frame = tk.Frame(self.root, bg="#f3f7fc")
        jd_btn_frame.pack()
        tk.Button(jd_btn_frame, text="Upload Job Description", command=self.upload_jd).pack(side=tk.LEFT, padx=5)
        tk.Button(jd_btn_frame, text="Clear JD", command=lambda: self.jd_text_box.delete("1.0", tk.END)).pack(side=tk.LEFT)

        # Upload resumes button
        tk.Button(self.root, text="Upload Resumes", command=self.upload_resumes).pack(pady=10)

        # Scan and rank button
        tk.Button(self.root, text="Scan and Rank Resumes", command=self.scan_resumes).pack(pady=5)

    def upload_jd(self):
        filepath = filedialog.askopenfilename(filetypes=[("Text Files", "*.txt *.pdf *.docx")])
        if filepath:
            try:
                if filepath.endswith(".txt"):
                    with open(filepath, 'r', encoding="utf-8") as f:
                        text = f.read()
                elif filepath.endswith(".pdf"):
                    text = extract_text_from_pdf(filepath)
                elif filepath.endswith(".docx"):
                    text = extract_text_from_docx(filepath)
                else:
                    messagebox.showerror("Unsupported File", "Please upload a .txt, .pdf or .docx file")
                    return
                self.jd_text_box.delete("1.0", tk.END)
                self.jd_text_box.insert(tk.END, text)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to read JD file: {str(e)}")

    def upload_resumes(self):
        files = filedialog.askopenfilenames(filetypes=[("Documents", "*.pdf *.docx *.txt")])
        self.resume_texts.clear()
        self.filenames.clear()
        if files:
            for file in files:
                if file.endswith(".txt"):
                    with open(file, 'r', encoding="utf-8") as f:
                        self.resume_texts.append(f.read())
                elif file.endswith(".pdf"):
                    self.resume_texts.append(extract_text_from_pdf(file))
                elif file.endswith(".docx"):
                    self.resume_texts.append(extract_text_from_docx(file))
                self.filenames.append(os.path.basename(file))
            messagebox.showinfo("Upload Successful", f"{len(files)} resumes uploaded.")

    def scan_resumes(self):
        jd_text = self.jd_text_box.get("1.0", tk.END).strip()
        if not jd_text:
            messagebox.showwarning("Missing JD", "Please paste or upload a job description first.")
            return
        if not self.resume_texts:
            messagebox.showwarning("No Resumes", "Please upload resumes to scan.")
            return

        self.progress["value"] = 0
        self.root.update_idletasks()

        scores = match_resumes_to_jd(self.resume_texts, jd_text)
        skill_matches = [", ".join(extract_skills_from_text(text)) for text in self.resume_texts]

        df = pd.DataFrame({
            "Resume": self.filenames,
            "Match Score (%)": [round(s * 100, 2) for s in scores],
            "Skills Found": skill_matches
        }).sort_values(by="Match Score (%)", ascending=False)

        self.tree.delete(*self.tree.get_children())
        for idx, row in df.iterrows():
            self.tree.insert("", tk.END, values=(row["Resume"], row["Match Score (%)"], row["Skills Found"]))

        self.progress["value"] = 100
        self.root.update_idletasks()
        messagebox.showinfo("Scan Complete", "Resumes have been scanned and ranked.")
        self.progress["value"] = 0
        self.progress_label.config(text="Scan Results Preview:")
        self.progress_label.pack()
        self.tree.pack(pady=5)
        self.tree.bind("<Double-1>", self.on_tree_select)


if __name__ == "__main__":
    root = tk.Tk()
    app = ResumeScannerApp(root)
    root.mainloop()
