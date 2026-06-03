from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NexHire ResumeAI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router.router, prefix="/api/resume", tags=["Resume AI"])


@app.get("/health")
def health():
    return {"status": "ResumeAI running"}
