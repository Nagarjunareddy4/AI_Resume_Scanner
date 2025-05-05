
import os
import docx
import PyPDF2
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def extract_text_from_pdf(filepath):
    text = ""
    with open(filepath, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(filepath):
    doc = docx.Document(filepath)
    return '\n'.join([para.text for para in doc.paragraphs])

def extract_skills_from_text(text):
    # A basic list of common skills; you can expand this
    skills_list = [
        "python", "java", "c++", "aws", "azure", "docker", "kubernetes",
        "sql", "nosql", "machine learning", "data science", "flask",
        "django", "linux", "git", "ci/cd", "html", "css", "javascript"
    ]
    found_skills = set()
    text_lower = text.lower()
    for skill in skills_list:
        if skill in text_lower:
            found_skills.add(skill)
    return list(found_skills)

def match_resumes_to_jd(resume_texts, jd_text):
    documents = [jd_text] + resume_texts
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(documents)
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    return cosine_similarities.tolist()
