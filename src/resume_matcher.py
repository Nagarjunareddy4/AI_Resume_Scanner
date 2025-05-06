import re
import docx2txt
import PyPDF2
import os
import spacy
import en_core_web_sm
nlp = en_core_web_sm.load()


def extract_text_from_pdf(path):
    text = ""
    with open(path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(path):
    return docx2txt.process(path)

def extract_keywords_from_jd(jd_text):
    doc = nlp(jd_text)
    keywords = [chunk.text.lower() for chunk in doc.noun_chunks if len(chunk.text) > 1]
    return list(set(keywords))

def match_resumes_to_jd(resume_texts, jd_text):
    jd_keywords = extract_keywords_from_jd(jd_text)
    scores = []
    skill_matches = []
    for resume in resume_texts:
        matched_skills = [kw for kw in jd_keywords if kw in resume.lower()]
        score = len(matched_skills) / len(jd_keywords) if jd_keywords else 0
        scores.append(score)
        skill_matches.append(", ".join(set(matched_skills)))
    return scores, skill_matches
