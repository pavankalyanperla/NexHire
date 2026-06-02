from fastapi import APIRouter, UploadFile, File
import anthropic
import pdfplumber
import os

router = APIRouter()


@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """Parse and analyze a resume PDF using Claude AI."""
    content = await file.read()
    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Analyze this resume and extract: name, skills, experience, education, and a fit score (0-100).\n\n{text}"
        }]
    )
    return {"analysis": message.content[0].text}


@router.post("/score")
async def score_resume(file: UploadFile = File(...), job_description: str = ""):
    """Score a resume against a job description."""
    return {"score": 0, "message": "Scoring endpoint stub"}
