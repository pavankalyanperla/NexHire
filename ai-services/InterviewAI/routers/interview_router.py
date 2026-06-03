import json
import re
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

HR_POLICY = """
NexHire HR Policies:
- Annual Leave: 18 days per year (1.5 days per month)
- Sick Leave: 12 days per year
- Casual Leave: 6 days per year
- Maternity Leave: 26 weeks
- Paternity Leave: 5 days
- Work Hours: 9 AM to 6 PM, Monday to Friday (9 hours)
- Work From Home: 2 days per week allowed after 3-month probation
- Probation Period: 6 months
- Notice Period: 2 months
- Salary Cycle: Monthly, credited on 1st working day
- Medical Insurance: 5 Lakhs family floater
- Gratuity: After 5 years of service
- Leave Encashment: Up to 30 days per year
- Public Holidays: 10 days per year (as per government notification)
"""


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    return Groq(api_key=api_key)


def call_groq(prompt: str, max_tokens: int = 1024) -> str:
    client = get_groq_client()
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.3
    )
    return response.choices[0].message.content


def call_groq_chat(system_prompt: str, user_message: str, max_tokens: int = 512) -> str:
    client = get_groq_client()
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        max_tokens=max_tokens,
        temperature=0.4
    )
    return response.choices[0].message.content


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
# POST /api/interview/generate-questions
# ─────────────────────────────────────────────────────────────
class QuestionRequest(BaseModel):
    job_title: str
    required_skills: str
    experience_level: str
    candidate_name: str


@router.post("/generate-questions")
async def generate_questions(request: QuestionRequest):
    prompt = f"""You are a senior technical interviewer at NexHire. Generate interview questions for this candidate and return ONLY valid JSON with no extra text.

JOB: {request.job_title} ({request.experience_level} level)
REQUIRED SKILLS: {request.required_skills}
CANDIDATE: {request.candidate_name}

Return ONLY this JSON structure:
{{
    "technical_questions": [
        {{"id": 1, "question": "<question>", "difficulty": "<Easy|Medium|Hard>"}},
        {{"id": 2, "question": "<question>", "difficulty": "<difficulty>"}},
        {{"id": 3, "question": "<question>", "difficulty": "<difficulty>"}},
        {{"id": 4, "question": "<question>", "difficulty": "<difficulty>"}},
        {{"id": 5, "question": "<question>", "difficulty": "<difficulty>"}}
    ],
    "hr_questions": [
        {{"id": 6, "question": "Tell me about yourself and your career journey"}},
        {{"id": 7, "question": "Why do you want to join NexHire?"}},
        {{"id": 8, "question": "Where do you see yourself in 5 years?"}}
    ],
    "scenario_questions": [
        {{"id": 9, "question": "<role-relevant scenario question>"}},
        {{"id": 10, "question": "<another scenario question>"}}
    ]
}}"""

    try:
        response_text = call_groq(prompt, max_tokens=1024)
        return extract_json_from_text(response_text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")


# ─────────────────────────────────────────────────────────────
# POST /api/interview/evaluate-answers
# ─────────────────────────────────────────────────────────────
class QnA(BaseModel):
    question: str
    answer: str


class EvaluateRequest(BaseModel):
    job_title: str
    questions_and_answers: List[QnA]


@router.post("/evaluate-answers")
async def evaluate_answers(request: EvaluateRequest):
    qa_text = "\n".join([
        f"Q{i+1}: {qa.question}\nA{i+1}: {qa.answer}"
        for i, qa in enumerate(request.questions_and_answers)
    ])

    prompt = f"""You are a senior interviewer evaluating a candidate for {request.job_title}. Assess these answers and return ONLY valid JSON with no extra text.

{qa_text}

Return ONLY this JSON:
{{
    "overall_score": <0-100>,
    "overall_feedback": "<2-3 sentences>",
    "recommendation": "<Proceed to next round|Reject|Hold>",
    "question_evaluations": [
        {{
            "question": "<question text>",
            "score": <0-100>,
            "feedback": "<brief feedback>",
            "strengths": "<what was good>",
            "improvements": "<what could be better>"
        }}
    ],
    "top_strengths": ["<strength1>", "<strength2>"],
    "areas_for_improvement": ["<area1>", "<area2>"]
}}"""

    try:
        response_text = call_groq(prompt, max_tokens=2048)
        return extract_json_from_text(response_text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


# ─────────────────────────────────────────────────────────────
# POST /api/interview/performance-insights
# ─────────────────────────────────────────────────────────────
class PerformanceInsightRequest(BaseModel):
    employee_name: str
    department: str
    designation: str
    self_rating: int
    manager_rating: int
    self_comments: str
    manager_comments: str
    goals: str
    month: int
    year: int


@router.post("/performance-insights")
async def performance_insights(request: PerformanceInsightRequest):
    prompt = f"""You are an expert HR performance coach at NexHire. Analyze this employee performance review and return ONLY valid JSON with no extra text.

EMPLOYEE: {request.employee_name}
DEPARTMENT: {request.department}
DESIGNATION: {request.designation}
MONTH/YEAR: {request.month}/{request.year}
SELF RATING: {request.self_rating}/5
MANAGER RATING: {request.manager_rating}/5
SELF COMMENTS: {request.self_comments}
MANAGER COMMENTS: {request.manager_comments}
CURRENT GOALS: {request.goals}

Return ONLY this JSON:
{{
    "performance_level": "<Excellent|Good|Satisfactory|Needs Improvement>",
    "overall_insight": "<2-3 sentence summary>",
    "strengths": ["<strength1>", "<strength2>", "<strength3>"],
    "improvement_areas": ["<area1>", "<area2>"],
    "recommended_actions": ["<action1>", "<action2>", "<action3>"],
    "goal_assessment": "<assessment of current goals>",
    "next_month_goals": ["<goal1>", "<goal2>"]
}}"""

    try:
        response_text = call_groq(prompt)
        return extract_json_from_text(response_text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance insights failed: {str(e)}")


# ─────────────────────────────────────────────────────────────
# POST /api/interview/chatbot
# ─────────────────────────────────────────────────────────────
class ChatbotRequest(BaseModel):
    question: str
    employee_name: str
    department: Optional[str] = "General"


@router.post("/chatbot")
async def chatbot(request: ChatbotRequest):
    system_prompt = f"""You are NexHire's friendly and professional AI HR Assistant. Answer employee HR policy questions accurately and helpfully.

{HR_POLICY}

Rules:
- Answer based on the policies above only
- Be concise and friendly (2-4 sentences)
- If asked about something outside HR policy, say: "I can only assist with HR-related queries. Please contact the HR team for other questions."
- Address the employee by name when appropriate"""

    user_message = f"{request.employee_name} from {request.department} asks: {request.question}"

    try:
        answer = call_groq_chat(system_prompt, user_message, max_tokens=512)

        q_lower = request.question.lower()
        if any(w in q_lower for w in ["leave", "annual", "sick", "casual", "holiday"]):
            category = "Leave Policy"
        elif any(w in q_lower for w in ["salary", "pay", "payroll", "increment"]):
            category = "Compensation"
        elif any(w in q_lower for w in ["wfh", "work from home", "remote", "hybrid"]):
            category = "Work Policy"
        elif any(w in q_lower for w in ["notice", "resign", "probation"]):
            category = "Employment Terms"
        else:
            category = "General HR"

        return {"answer": answer, "category": category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot failed: {str(e)}")
