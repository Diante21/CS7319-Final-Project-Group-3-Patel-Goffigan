# CS7319 Architecture Project — AI Resume Analyzer

A web-based AI Resume Analyzer that evaluates resumes, generates structured scores (0–100), and provides actionable feedback. Implemented with two different backend architectures for comparison.

---

## System Overview

| Component | Technology | Port |
|---|---|---|
| Frontend | React + TypeScript | 3000 |
| Backend (Layered) | Node.js + Express + TypeScript | 3001 |
| Backend (Event-Based) | Node.js + Express + TypeScript | 3002 |

### Features
- **Text input or file upload** (.txt, .pdf)
- **AI-style scoring** (0–100) with letter grade
- **Section analysis**: Contact, Summary, Experience, Education, Skills, Projects, Certifications
- **Keyword gap analysis**: Technical skills, Soft skills, Action verbs
- **Actionable feedback**: Critical issues, Improvements, Strengths
- **Result storage**: All analyses saved to `data/results.json` for debugging
- **Architecture toggle**: Switch between backends from the UI

---

## Architecture Comparison

### 1. Layered Monolithic Architecture (`backend-layered/`)

A traditional 4-tier layered approach where each layer has a single, well-defined responsibility and only calls the layer directly below it.

```
┌─────────────────────────────────┐
│      Presentation Layer         │  analyzeRoutes.ts — HTTP endpoints
├─────────────────────────────────┤
│      Business Logic Layer       │  analyzeService.ts, scoringService.ts,
│                                 │  feedbackService.ts
├─────────────────────────────────┤
│      Data Access Layer          │  resultsRepository.ts — JSON file I/O
├─────────────────────────────────┤
│      Model Layer                │  types.ts — TypeScript interfaces
└─────────────────────────────────┘
```

**Pros:** Easy to reason about, clear call chain, straightforward debugging.  
**Cons:** Tight coupling between layers; adding a new analysis step requires modifying multiple layers.

### 2. Event-Based (Implicit Invocation) Architecture (`backend-eventbased/`)

Components are decoupled — they communicate exclusively through a central `EventBus` and never call each other directly.

```
HTTP Request
    │
    ▼
EventBus.emit('resume:submitted')
    │
    ├─► parseHandler    → emit 'resume:parsed'
    │       │
    ├───────┴─► analyzeHandler  → emit 'resume:analyzed'
    │               │
    ├───────────────┴─► scoreHandler  → emit 'resume:scored'
    │                       │
    ├───────────────────────┴─► feedbackHandler → emit 'resume:feedback:generated'
    │                                   │
    └───────────────────────────────────┴─► storageHandler → emit 'resume:stored'
                                                                    │
                                                            HTTP Response ◄──────┘
```

**Pros:** Highly decoupled; adding a new step (e.g., email notification) requires zero changes to existing handlers.  
**Cons:** Harder to trace control flow; async coordination via events adds complexity.

---

## Project Structure

```
CS7319-Architecture-Project/
├── frontend/              # React + TypeScript frontend
│   └── src/
│       ├── App.tsx
│       ├── api.ts
│       ├── types.ts
│       └── components/
│           ├── ResumeForm.tsx
│           ├── ScoreGauge.tsx
│           ├── ResultsDisplay.tsx
│           └── HistoryPanel.tsx
│
├── backend-layered/       # Layered Monolithic Architecture
│   └── src/
│       ├── index.ts
│       ├── routes/
│       ├── services/
│       ├── dataAccess/
│       └── models/
│
└── backend-eventbased/    # Event-Based Architecture
    └── src/
        ├── index.ts
        ├── events/
        ├── handlers/
        ├── routes/
        └── models/
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

**Backend — Layered (port 3001):**
```bash
cd backend-layered
npm install
npm run build
npm start
# OR for development: npm run dev
```

**Backend — Event-Based (port 3002):**
```bash
cd backend-eventbased
npm install
npm run build
npm start
```

**Frontend (port 3000):**
```bash
cd frontend
npm install
npm start
```

### API Endpoints (same for both backends)

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/analyze` | Analyze resume (JSON `{text}` or multipart file) |
| `GET` | `/api/results` | List all stored results |
| `GET` | `/api/results/:id` | Get a specific result |

### Example Request
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Jane Smith\njane@example.com\n\nSUMMARY\n5 years experience in software engineering...\n\nEXPERIENCE\n..."}'
```

### Example Response
```json
{
  "id": "abc-123",
  "timestamp": "2026-03-29T00:00:00.000Z",
  "overallScore": 82,
  "grade": "A",
  "sections": [
    { "name": "Contact Information", "score": 4, "maxScore": 4, "feedback": ["..."] }
  ],
  "keywords": {
    "technical": { "found": ["JavaScript", "React"], "missing": ["..."], "density": 5.2 },
    "softSkills": { "found": ["leadership"], "missing": ["..."], "density": 1.1 },
    "actionVerbs": { "found": ["developed", "led"], "missing": ["..."], "density": 2.0 }
  },
  "feedback": {
    "critical": [],
    "improvements": ["Use more action verbs..."],
    "strengths": ["Strong technical keyword coverage..."]
  },
  "rawTextLength": 512
}
```

---

## Scoring Breakdown

| Category | Max Points | Details |
|---|---|---|
| Sections | 28 | Contact (4) + Summary (4) + Experience (8) + Education (6) + Skills (6) |
| Technical Keywords | 25 | 2.5 pts per keyword found, capped at 25 |
| Soft Skills | 10 | 1.5 pts per keyword found, capped at 10 |
| Action Verbs | 15 | 1.5 pts per verb found, capped at 15 |
| Content Quality | 22 | Length + quantified achievements + ATS compliance |
| **Total** | **100** | |

| Score | Grade |
|---|---|
| 90–100 | A+ |
| 80–89 | A |
| 70–79 | B |
| 60–69 | C |
| 50–59 | D |
| &lt;50 | F |
