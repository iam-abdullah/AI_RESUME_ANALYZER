Md Abdullah 24-05-2026 02:10 • # 🎯 AI Resume Analyzer & PDF Editor

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 An AI-powered resume analyzer that scores your resume against any job description, provides section-by-section improvement suggestions, and lets you edit your PDF/DOCX directly in the browser — all powered by **Google Gemini 2.0 Flash**.

![Demo Preview](https://via.placeholder.com/800x400.png?text=AI+Resume+Analyzer+Demo)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **ATS Score** | Get an instant ATS compatibility score (0-100) based on your job description |
| 🔑 **Keyword Analysis** | See which keywords from the JD are missing or matched in your resume |
| 📋 **Section-wise Suggestions** | Detailed feedback for every section: Summary, Skills, Experience, Education, Projects, etc. |
| ✏️ **Grammar Checker** | AI-powered grammar and phrasing suggestions |
| 🖊️ **Live PDF Editor** | Edit your PDF directly in the browser — no format loss |
| 📝 **DOCX Support** | Full support for both PDF and DOCX resume formats |
| 🔄 **Re-analyze** | After editing, get a fresh ATS score with one click |
| 📥 **Download** | Export your improved resume in original format |

---

## 🛠️ Tech Stack

### Backend
- **[Flask](https://flask.palletsprojects.com/)** — Lightweight Python web framework
- **[pdfplumber](https://github.com/jsvine/pdfplumber)** — PDF text extraction with coordinates
- **[pypdf](https://pypdf.readthedocs.io/)** — PDF reading and writing
- **[ReportLab](https://www.reportlab.com/)** — PDF generation and overlays
- **[python-docx](https://python-docx.readthedocs.io/)** — DOCX manipulation
- **[Pillow](https://python-pillow.org/)** — Image processing for PDF previews

### AI
- **[Google Gemini 2.0 Flash](https://ai.google.dev/)** — Resume analysis and grammar checking

### Frontend
- **Vanilla JavaScript** — No framework dependencies
- **HTML5 + CSS3** — Modern, responsive UI

---

## 📁 Project Structure
