import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
import pdfplumber
from docx import Document

GEMINI_API_KEY = " YOUR_GEMINI_API_KEY_HERE "
genai.configure(api_key = GEMINI_API_KEY)


def extract_text_from_resume(filepath, ext):
    text = ""
    if ext == 'pdf':
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    elif ext in ('docx', 'doc'):
        doc = Document(filepath)
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text.strip()


def analyze_resume(resume_text, role, job_description):
    prompt = f"""
You are an expert ATS analyzer. Return ONLY valid JSON (no markdown).

Target Role: {role}

Job Description:
{job_description}

Resume:
{resume_text}

Return JSON:
{{
  "ats_score": <0-100>,
  "score_breakdown": {{
    "keyword_match": <0-100>,
    "skills_relevance": <0-100>,
    "experience_match": <0-100>,
    "formatting_quality": <0-100>,
    "education_match": <0-100>
  }},
  "missing_keywords": ["keyword1", "keyword2"],
  "matched_keywords": ["keyword1", "keyword2"],
  "section_analysis": {{
    "contact_info": {{"status": "good|needs_improvement|missing", "issues": [], "suggestions": []}},
    "professional_summary": {{"status": "...", "issues": [], "suggestions": []}},
    "skills": {{"status": "...", "issues": [], "suggestions": [], "missing_skills": []}},
    "work_experience": {{"status": "...", "issues": [], "suggestions": []}},
    "education": {{"status": "...", "issues": [], "suggestions": []}},
    "projects": {{"status": "...", "issues": [], "suggestions": []}},
    "certifications": {{"status": "...", "issues": [], "suggestions": []}}
  }},
  "grammar_errors": [
    {{"original": "...", "corrected": "...", "section": "..."}}
  ],
  "overall_recommendation": "...",
  "strengths": [],
  "weaknesses": []
}}
"""
    try:
        model = genai.GenerativeModel('gemini-3.5-flash')
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.3, "response_mime_type": "application/json"}
        )
        result_text = response.text.strip()
        result_text = re.sub(r'^```json\s*|\s*```$', '', result_text, flags=re.MULTILINE)
        return json.loads(result_text)
    except json.JSONDecodeError as e:
        return {"error": "JSON parse failed", "details": str(e)}
    except Exception as e:
        return {"error": "Gemini API error", "details": str(e)}