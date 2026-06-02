from fastapi import APIRouter
from pydantic import BaseModel
import anthropic
import os

router = APIRouter()


class InterviewRequest(BaseModel):
    job_role: str
    candidate_resume_summary: str
    num_questions: int = 5


class EvaluationRequest(BaseModel):
    question: str
    answer: str
    job_role: str


@router.post("/generate-questions")
async def generate_questions(request: InterviewRequest):
    """Generate tailored interview questions using Claude AI."""
    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
                f"Generate {request.num_questions} technical interview questions for a {request.job_role} role. "
                f"Candidate summary: {request.candidate_resume_summary}"
            )
        }]
    )
    return {"questions": message.content[0].text}


@router.post("/evaluate-answer")
async def evaluate_answer(request: EvaluationRequest):
    """Evaluate a candidate's interview answer."""
    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": (
                f"Evaluate this interview answer for a {request.job_role} role.\n"
                f"Question: {request.question}\nAnswer: {request.answer}\n"
                "Provide a score (0-10) and brief feedback."
            )
        }]
    )
    return {"evaluation": message.content[0].text}
