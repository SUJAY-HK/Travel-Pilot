from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uuid
import asyncio
from agent import TravelAgentService

app = FastAPI(title="TravelPilot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://travel-pilot.sujay-hk.in",
        "https://travel-pilot.vercel.app",
        "https://travel-pilot-git-main-sujay-hks-projects.vercel.app/",
    ],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage
# Structure: { session_id: { "agent": agent_obj, "client": client_obj, "history": [] } }
sessions: Dict[str, Dict[str, Any]] = {}

service = TravelAgentService()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    
    # Initialize session if it doesn't exist
    if session_id not in sessions:
        try:
            agent, client = await service.create_agent()
            sessions[session_id] = {
                "agent": agent, 
                "client": client, 
                "history": []
            }
        except Exception as e:
            # If agent creation fails (e.g., API key missing)
            raise HTTPException(status_code=500, detail=f"Failed to initialize agent: {str(e)}")
    
    session = sessions[session_id]
    agent = session["agent"]
    
    # Construct prompt with history
    # We limit history to last 5 turns to avoid token limits if necessary, 
    # but for now we include all.
    history_context = ""
    if session["history"]:
        history_context = "Previous conversation history:\n"
        for entry in session["history"]:
            history_context += f"User: {entry['user']}\nAI: {entry['ai']}\n"
        history_context += "\nInstructions: Use the history above to understand context. Answer the Current User Request below.\n"
    
    full_prompt = f"{history_context}Current User Request: {request.message}"
    
    try:
        # Run the agent
        # agent.run() returns the result string
        result = await agent.run(full_prompt)
        
        # Update history
        session["history"].append({"user": request.message, "ai": str(result)})
        
        return ChatResponse(response=str(result), session_id=session_id)
        
    except Exception as e:
        # Log error
        print(f"Error processing request: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok"}
