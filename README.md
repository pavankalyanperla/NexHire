# NexHire — AI-Powered Next Generation HRMS

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285F4?logo=google)
![CI](https://github.com/pavankalyanperla/NexHire/actions/workflows/ci.yml/badge.svg)

> **Built for FWC IT Services Hackathon 2026** — Theme: *Build the Future of HR Management with AI-Powered Solutions*

NexHire is a full-stack, AI-powered Human Resource Management System designed for the modern enterprise. It combines clean-architecture microservices with Google Gemini AI to automate the entire employee lifecycle — from hiring to performance review.

---

## Features

### Core HRMS
- **Employee Management** — Full CRUD, department/designation assignment, status tracking
- **Attendance** — Check-in/out with timestamps, monthly summaries, working hours calculation
- **Leave Management** — Leave requests, manager approvals, leave balance tracking
- **Payroll** — Auto salary calculation, payslip generation, bulk monthly processing
- **Performance Reviews** — Self + manager ratings, KPI tracking, review cycles
- **Onboarding** — Document checklist, IT setup tracking, offer letter status

### AI Features (7 total)
| # | Feature | Powered By |
|---|---------|------------|
| 1 | Resume Screening — PDF upload, AI match scoring | Gemini 1.5 Flash |
| 2 | Bulk Candidate Ranking — rank all applicants automatically | Gemini 1.5 Flash |
| 3 | Interview Question Generator — role-specific questions | Gemini 1.5 Flash |
| 4 | Answer Evaluation — AI scores candidate responses | Gemini 1.5 Flash |
| 5 | Performance Insights — AI coaching from review data | Gemini 1.5 Flash |
| 6 | HR Policy Chatbot — instant answers on leave/salary policies | Gemini 1.5 Flash |
| 7 | Voice Input — speak to the AI chatbot using microphone | Web Speech API |

### Role-Based Portals
| Role | Portal | Key Features |
|------|--------|-------------|
| ManagementAdmin | `/admin` | Company-wide analytics, all modules |
| SeniorManager | `/manager` | Team management, leave approvals, performance |
| HRRecruiter | `/hr` | Employee CRUD, recruitment pipeline, onboarding |
| Employee | `/employee` | Self-service, payslips, attendance, AI chatbot |

---

## Architecture

```
Angular 21 (Port 4200)
         │
Ocelot API Gateway (Port 5000)
         │
┌────────┼────────────────────┐
│        │                    │
IdentityService  HRMSService  RecruitmentService
(Port 5100)      (Port 5200)  (Port 5300)
                              │
                 ┌────────────┴───────────┐
           ResumeAI (8001)     InterviewAI (8002)
              [Python FastAPI + Gemini AI]
         │
   SQL Server (3 separate databases)
```

See [docs/architecture.md](docs/architecture.md) for the full Mermaid diagram, data flow walkthroughs, and Docker network topology.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 + PrimeNG 21 Aura theme |
| Backend | ASP.NET Core 10 — Clean Architecture (Domain / Application / Infrastructure / API) |
| AI Services | Python FastAPI + Google Gemini 1.5 Flash |
| Database | SQL Server 2022 Express (3 isolated databases) |
| Gateway | Ocelot API Gateway |
| Auth | JWT Bearer Tokens (shared secret, role claims) |
| DevOps | Docker, Docker Compose, GitHub Actions CI/CD |

---

## Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- SQL Server Express (`.\SQLEXPRESS`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for containerised run)

### Local Development

**1. Clone**
```bash
git clone https://github.com/pavankalyanperla/NexHire.git
cd NexHire
```

**2. Environment**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**3. Create databases** (run in SSMS or sqlcmd)
```sql
CREATE DATABASE NexHire_IdentityDB;
CREATE DATABASE NexHire_HRMSDB;
CREATE DATABASE NexHire_RecruitmentDB;
```

**4. Start backend services** (each in its own terminal)
```bash
cd backend/IdentityService/IdentityService.API    && dotnet run
cd backend/HRMSService/HRMSService.API            && dotnet run
cd backend/RecruitmentService/RecruitmentService.API && dotnet run
cd gateway/OcelotGateway                          && dotnet run
```

**5. Start AI services**
```bash
cd ai-services/ResumeAI
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload

cd ai-services/InterviewAI
pip install -r requirements.txt
uvicorn main:app --port 8002 --reload
```

**6. Start Angular**
```bash
cd frontend/nexhire-angular
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

### Docker (Full Stack)

```bash
# Copy and configure .env
cp .env.example .env
# Add GEMINI_API_KEY to .env

# Build and start all 8 containers
docker-compose up --build

# Or detached
docker-compose up --build -d
```

Open [http://localhost:4200](http://localhost:4200)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Management Admin | admin@nexhire.com | Admin@123 |
| Senior Manager | manager@nexhire.com | Manager@123 |
| HR Recruiter | hr@nexhire.com | HR@123 |
| Employee | employee@nexhire.com | Employee@123 |

---

## API Documentation

| Service | Swagger / Docs URL |
|---------|-------------------|
| Identity Service | http://localhost:5100/swagger |
| HRMS Service | http://localhost:5200/swagger |
| Recruitment Service | http://localhost:5300/swagger |
| ResumeAI | http://localhost:8001/docs |
| InterviewAI | http://localhost:8002/docs |
| Gateway | http://localhost:5000 (proxies all `/api/*` routes) |

### Key API Endpoints

**Auth** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |

**Employees** (`/api/employees`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/employees/by-user/{userId}` | Get employee by auth userId |

**Analytics** (`/api/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/company-overview` | Admin dashboard stats |
| GET | `/api/analytics/hr-overview` | HR dashboard stats |
| GET | `/api/analytics/manager-overview/{managerUserId}` | Manager team stats |
| GET | `/api/analytics/employee-overview/{employeeId}` | Employee personal stats |
| GET | `/api/analytics/recruitment-stats` | Open jobs, applications, hired |

**Recruitment** (`/api/candidates`, `/api/jobpostings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidates/{id}/screen` | AI screen a resume PDF |
| POST | `/api/candidates/rank-all/{jobId}` | AI rank all applicants for a job |
| POST | `/api/ai/chatbot` | HR policy chatbot |
| POST | `/api/ai/generate-questions` | AI interview questions |
| POST | `/api/ai/evaluate-answers` | AI answer evaluation |
| POST | `/api/ai/performance-insights` | AI coaching from review data |

---

## Project Structure

```
NexHire/
├── backend/
│   ├── IdentityService/          # Auth, JWT, user roles
│   │   ├── IdentityService.Domain/
│   │   ├── IdentityService.Application/
│   │   ├── IdentityService.Infrastructure/
│   │   └── IdentityService.API/
│   ├── HRMSService/              # Core HR (employees, attendance, payroll...)
│   └── RecruitmentService/       # Jobs, candidates, AI orchestration
├── ai-services/
│   ├── ResumeAI/                 # FastAPI — resume parsing & screening
│   └── InterviewAI/              # FastAPI — questions, chatbot, insights
├── gateway/
│   └── OcelotGateway/            # Single API entry point
├── frontend/
│   └── nexhire-angular/          # Angular 21 + PrimeNG
├── docs/
│   └── architecture.md           # Full architecture diagram
├── .github/
│   └── workflows/ci.yml          # GitHub Actions CI/CD
├── docker-compose.yml
└── .env.example
```

---

## Scalability

NexHire is designed to scale to **5,000+ employees**:

- **Microservices** — each service scales independently based on load
- **Ocelot Gateway** — centralised routing; swap for Kong/Nginx for L7 load balancing
- **Stateless JWT auth** — no server-side sessions; horizontal scaling with zero coordination
- **Separate databases** — IdentityDB, HRMSDB, RecruitmentDB isolate domain data
- **Async AI services** — Python services scale independently; add GPU nodes as needed
- **Docker Compose → Kubernetes** — compose services map 1:1 to K8s Deployments/Services
- **EF Core migrations** — schema changes deployed via migration pipeline, zero downtime capable

---

## CI/CD

GitHub Actions runs on every push to `main`:
- **build-dotnet** — Builds all 3 .NET services + OcelotGateway
- **build-angular** — `npm ci` + `ng build`
- **build-python** — Installs deps + validates Python syntax

See [.github/workflows/ci.yml](.github/workflows/ci.yml)

---

## Hackathon Highlights

| Requirement | NexHire |
|-------------|---------|
| AI features (min 4) | **7 AI features** |
| Role-based portals | **4 portals** |
| Microservices | **3 .NET + 2 Python = 5 services** |
| Clean Architecture | All 3 .NET services follow Domain/Application/Infrastructure/API layers |
| Containerisation | **8 Docker containers** via Docker Compose |
| CI/CD | GitHub Actions (build all 3 stacks) |
| Voice AI | Web Speech API mic input for HR chatbot |

---

Built with [Claude Code](https://claude.ai/claude-code) · Hackathon 2026
