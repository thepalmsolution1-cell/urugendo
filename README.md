# Urugendo

Urugendo is a hybrid web application monorepo combining Node.js/Express core services, Python FastAPI for AI intelligence (NVIDIA NIM integration & vector embeddings), and React (Vite) for the web client.

## Repository Architecture

```
urugendo/
├── backend/       # Node.js + Express + Prisma ORM (Auth, Bookings, Budget Engine)
├── ml-service/    # Python FastAPI + NVIDIA NIM (Intent Extraction, Vector Embeddings)
└── frontend/      # React + Vite (Web Client UI)
```

---

## Prerequisites

Before starting local development, ensure you have the following installed:

- **Node.js**: v18.x or v20.x+
- **npm**: v9.x or higher (npm workspaces support)
- **Python**: v3.10+ and `pip`
- **PostgreSQL**: v15+ with `pgvector` extension enabled

---

## Environment Setup

Copy `.env.example` to `.env` in the root directory or configure service environment files as needed:

```bash
cp .env.example .env
```

---

## Local Development Setup

### 1. Root & Node Services Installation (Backend & Frontend)

Install all Node dependencies for workspace packages from the root:

```bash
npm install
```

### 2. Backend Setup (`/backend`)

Navigate to the backend directory, initialize Prisma, and generate the client:

```bash
cd backend
npm run prisma:generate
# To apply migrations to your local PostgreSQL database:
# npm run prisma:migrate
```

### 3. ML Service Setup (`/ml-service`)

Create and activate a Python virtual environment, then install dependencies:

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt
```

---

## Running All Three Services Locally

You can run each service in separate terminal windows:

### Terminal 1: Backend Service (Express)
```bash
# From root directory
npm run dev:backend
# Starts server on http://localhost:5000
```

### Terminal 2: ML Service (FastAPI)
```bash
# From ml-service directory (with venv active)
cd ml-service
uvicorn main:app --reload --port 8000
# Starts FastAPI server on http://localhost:8000
```

### Terminal 3: Frontend Client (React + Vite)
```bash
# From root directory
npm run dev:frontend
# Starts dev server on http://localhost:5173
```
