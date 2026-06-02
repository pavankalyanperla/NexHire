# NexHire — AI-Powered Next Generation HRMS

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?logo=microsoftsqlserver)

> NexHire is a full-stack, AI-powered Human Resource Management System built for the modern enterprise. It combines microservices architecture with Claude AI to automate resume analysis, interview preparation, and employee lifecycle management.

---

## Architecture Overview

```
Angular 21 (Frontend)
        │
Ocelot API Gateway (:5000)
        │
┌───────┼────────────────┐
│       │                │
IdentityService  HRMSService  RecruitmentService
(:5100)          (:5200)       (:5300)
        │
┌───────┴────────┐
ResumeAI (:8001)  InterviewAI (:8002)
    [Python FastAPI + Claude AI]
        │
   SQL Server (3 databases)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 + PrimeNG Aura |
| Backend | ASP.NET Core 10 — Clean Architecture |
| Gateway | Ocelot |
| AI Services | Python FastAPI + Anthropic Claude |
| Database | SQL Server 2022 |
| Auth | JWT |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## Microservices

| Service | Responsibility | Port |
|---------|---------------|------|
| IdentityService | Auth, JWT, Roles | 5100 |
| HRMSService | Employees, Attendance, Payroll, Performance | 5200 |
| RecruitmentService | Jobs, Applications, Candidate Pipeline | 5300 |
| ResumeAI | Resume parsing & scoring via Claude | 8001 |
| InterviewAI | Question generation & answer evaluation | 8002 |

## User Roles

- **ManagementAdmin** — Full system access, user management
- **SeniorManager** — Department oversight, approvals
- **HRRecruiter** — Recruitment pipeline, candidate management
- **Employee** — Self-service portal

## Setup Instructions

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- Python 3.11+
- SQL Server (local or Docker)
- Docker Desktop

### Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/pavankalyanperla/NexHire.git
   cd NexHire
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your CLAUDE_API_KEY
   ```

3. **Create databases** (if not using Docker)
   ```sql
   CREATE DATABASE NexHire_IdentityDB;
   CREATE DATABASE NexHire_HRMSDB;
   CREATE DATABASE NexHire_RecruitmentDB;
   ```

4. **Run backend services**
   ```bash
   cd backend/IdentityService/IdentityService.API && dotnet run
   cd backend/HRMSService/HRMSService.API && dotnet run
   cd backend/RecruitmentService/RecruitmentService.API && dotnet run
   ```

5. **Run AI services**
   ```bash
   cd ai-services/ResumeAI && pip install -r requirements.txt && uvicorn main:app --port 8001
   cd ai-services/InterviewAI && pip install -r requirements.txt && uvicorn main:app --port 8002
   ```

6. **Run Angular frontend**
   ```bash
   cd frontend/nexhire-angular && npm install && ng serve
   ```

### Docker (Full Stack)
```bash
docker-compose up --build
```

## Features

- [ ] JWT Authentication with role-based access
- [ ] Employee onboarding & lifecycle management
- [ ] Attendance & payroll tracking
- [ ] AI-powered resume parsing (Claude AI)
- [ ] AI-generated interview questions
- [ ] Recruitment pipeline management
- [ ] Dashboard analytics per role
- [ ] Performance review workflows

---

Built with Claude Code · Hackathon Project 2026
