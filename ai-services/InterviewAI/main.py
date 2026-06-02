from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import interview_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NexHire InterviewAI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_router.router, prefix="/api/interview", tags=["Interview"])


@app.get("/health")
def health():
    return {"status": "healthy", "service": "InterviewAI"}
