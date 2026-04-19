# AI Resume Analyzer — CS7319 Group 3

**CS-7319 Software Architecture & Design — Final Project**

Parth Patel (50304846) | Diante Goffigan (49371120)

---

## System Overview

| Component | Technology | Port |
|---|---|---|
| Frontend | React 18 + Vite | 5173 |
| Backend (Selected — Pipe & Filter) | Spring Boot 4.0.5 + Java 25 | 8082 |
| Backend (Unselected — Layered Monolithic) | Spring Boot 4.0.5 + Java 25 | 8081 |
| Database | PostgreSQL 16+ | 5432 |
| AI Integration | Anthropic Claude API (claude-opus-4-6) | — |

---

## Prerequisites

- Java 25
- Apache Maven 3.9+
- PostgreSQL 16+
- Node.js 18+

---

## Database Setup

```sql
CREATE DATABASE resume_analyzer;

CREATE TABLE resumes (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    file_name VARCHAR(255),
    job_description TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluation_results (
    id BIGSERIAL PRIMARY KEY,
    score INT NOT NULL,
    feedback TEXT,
    found_keywords TEXT,
    missing_keywords TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resume_id BIGINT UNIQUE,
    CONSTRAINT fk_resume FOREIGN KEY (resume_id) REFERENCES resumes(id)
);
```

---

## How to Run

**Terminal 1 — Pipe & Filter backend (port 8082):**
```bash
cd Selected/backend-pipefilter
mvn spring-boot:run
```

**Terminal 2 — Layered Monolithic backend (port 8081):**
```bash
cd Unselected/backend-layered/layered
mvn spring-boot:run
```

**Terminal 3 — Frontend (port 5173):**
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

CS-7319 Group 3 — Patel & Goffigan 