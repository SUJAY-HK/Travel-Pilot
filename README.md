# ✈️ Travel Pilot

**Travel Pilot** is a full-stack, AI-powered travel planning and accommodation assistant built using **Next.js**, **FastAPI**, **LangChain**, and **MCP (Model Context Protocol)**. It demonstrates how agentic AI systems can be productionized into a SaaS-quality application.

The app allows users to interact with an intelligent agent that reasons over travel queries and fetches relevant information using MCP-enabled tools.

---

## 🚀 Live Demo

- **Frontend**: [https://travel-pilot.sujay-hk.in](https://travel-pilot.sujay-hk.in)
- **Backend (API)**: [https://travel-pilot.onrender.com](https://travel-pilot.onrender.com)
- **API Docs (Swagger)**: [https://travel-pilot.onrender.com/docs](https://travel-pilot.onrender.com/docs)

---

## 🧠 What Problem Does Travel Pilot Solve?

Traditional travel platforms are search-heavy and require users to manually filter, compare, and decide.

**Travel Pilot** shifts this paradigm by:

- Accepting **natural language travel queries**
- Using **AI agents** to reason over intent
- Orchestrating external capabilities via **MCP tools**
- Returning **context-aware, conversational responses**

This makes travel planning more intuitive, faster, and intelligent.

---

## 🏗️ Architecture Overview

```
┌──────────────────┐
│  Next.js Frontend│
│  (Vercel)        │
└────────┬─────────┘
         │ HTTPS (Fetch)
┌────────▼─────────┐
│ FastAPI Backend  │
│ (Render)         │
│                  │
│ • LangChain      │
│ • MCP Client     │
│ • AI Agents      │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ MCP Servers /    │
│ External Tools   │
└──────────────────┘
```

---

## 🧰 Tech Stack

### Frontend

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Browser localStorage** (chat persistence)

### Backend

- **FastAPI** (ASGI backend)
- **Uvicorn** (ASGI server)
- **Python 3.12**
- **LangChain** (agent framework)
- **MCP (Model Context Protocol)** via `mcp-use`

### AI / LLM Providers

- **Google Gemini** (via `langchain-google-genai`)
- **Groq** (via `langchain-groq`)

### Deployment

- **Vercel** – Frontend hosting
- **Render** – Backend hosting
- **GitHub** – Version control & CI integration

---

## 🧠 Agentic AI & MCP Usage

Travel Pilot uses an **agent-based architecture**:

- A central **Travel Agent** interprets user intent
- The agent dynamically decides which tools to invoke
- MCP enables standardized access to external capabilities
- Responses are composed after reasoning + tool execution

This design allows:

- Tool extensibility without changing agent logic
- Clean separation between reasoning and execution
- SaaS-friendly scalability

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
GOOGLE_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
MCP_USE_ANONYMIZED_TELEMETRY=false
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=your_backend_url
```

> ⚠️ Secrets are **never committed** to GitHub.

---

## 📁 Repository Structure

```
Travel-Pilot/
├── frontend/        # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── backend/         # FastAPI + LangChain + MCP
│   ├── api.py
│   ├── agent.py
│   ├── pyproject.toml
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🧪 Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn api:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

---

## 👤 Author

**Sujay HK**

- GitHub: [https://github.com/SUJAY-HK](https://github.com/SUJAY-HK)
- LinkedIn: [https://www.linkedin.com/in/sujay-hk](https://www.linkedin.com/in/sujay-hk)

---

## ⭐ Acknowledgements

- FastAPI & Uvicorn
- LangChain
- MCP (Model Context Protocol) by AirBnb
- Vercel & Render

---

> This project is built as a **learning-driven, production-grade demonstration** of how agentic AI systems can be deployed as real-world SaaS applications.
