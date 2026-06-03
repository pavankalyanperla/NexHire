import json
import re
import os
import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, TYPE_CHECKING
if TYPE_CHECKING:
    # Allow type checkers/linters to resolve pdfplumber import without
    # requiring it at runtime in environments where it's not installed.
    import pdfplumber  # type: ignore

try:
    import pdfplumber  # type: ignore
except ImportError:
    pdfplumber = None
try:
    import google.generativeai as genai  # type: ignore
except ImportError:
    genai = None
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


def get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


def extract_json_from_text(text: str):
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        text = match.group(1).strip()
    start = min(
        (text.find('{') if text.find('{') >= 0 else len(text)),
        (text.find('[') if text.find('[') >= 0 else len(text))
    )
    if start < len(text):
        text = text[start:]
    return json.loads(text)


# ─────────────────────────────────────────────────────────────
# POST /api/resume/extract-text
# ─────────────────────────────────────────────────────────────
@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        if pdfplumber is None:
            raise HTTPException(status_code=500, detail="pdfplumber is not installed")
        contents = await file.read()
        text_parts = []
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
        return {"text": "\n".join(text_parts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


# ─────────────────────────────────────────────────────────────
# POST /api/resume/screen
# ─────────────────────────────────────────────────────────────
class ScreenRequest(BaseModel):
    resume_text: str
    job_title: str
    required_skills: str
    experience_level: str
    job_description: str


@router.post("/screen")
async def screen_resume(request: ScreenRequest):
    model = get_gemini_model()

    prompt = f"""You are an expert HR screening AI. Analyze this resume against the job requirements and return ONLY a valid JSON object with no additional text or explanation.

JOB TITLE: {request.job_title}
EXPERIENCE LEVEL: {request.experience_level}
REQUIRED SKILLS: {request.required_skills}
JOB DESCRIPTION: {request.job_description}

RESUME TEXT:
{request.resume_text[:3000]}

Return ONLY this JSON structure, no extra text:
{{
    "match_score": <integer 0-100>,
    "recommendation": "<one of: Highly Recommended, Recommended, Not Recommended>",
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill3"],
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1"],
    "summary": "<2-3 sentence summary of the candidate>"
}}"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text
        result = extract_json_from_text(response_text)
        return result
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screening failed: {str(e)}")


# ─────────────────────────────────────────────────────────────
# POST /api/resume/rank
# ─────────────────────────────────────────────────────────────
class CandidateInfo(BaseModel):
    application_id: int
    candidate_name: str
    resume_text: str


class RankRequest(BaseModel):
    candidates: List[CandidateInfo]
    job_title: str
    required_skills: str
    job_description: str


@router.post("/rank")
async def rank_candidates(request: RankRequest):
    model = get_gemini_model()

    candidates_text = "\n\n".join([
        f"CANDIDATE {i+1} (ID: {c.application_id}):\nName: {c.candidate_name}\nResume: {c.resume_text[:1000]}"
        for i, c in enumerate(request.candidates)
    ])

    prompt = f"""You are an expert HR AI. Rank these {len(request.candidates)} candidates for the job below. Return ONLY a valid JSON array, no extra text.

JOB: {request.job_title}
REQUIRED SKILLS: {request.required_skills}
DESCRIPTION: {request.job_description}

CANDIDATES:
{candidates_text}

Return ONLY this JSON array (one object per candidate):
[
  {{
    "application_id": <id>,
    "candidate_name": "<name>",
    "rank": <1 is best>,
    "match_score": <0-100>,
    "recommendation": "<Highly Recommended|Recommended|Not Recommended>",
    "key_strengths": "<one sentence>"
  }}
]"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text
        result = extract_json_from_text(response_text)
        if isinstance(result, list):
            result.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        return result
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Gemini ranking response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ranking failed: {str(e)}")