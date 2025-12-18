import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from mcp_use import MCPAgent, MCPClient

load_dotenv()

class TravelAgentService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
            # We don't raise here to allow instantiation, but create_agent will fail if key is missing for LLM
        
        self.config = {
            "mcpServers": {
                "airbnb": {
                    "command": "npx",
                    "args": [
                        "-y",
                        "@openbnb/mcp-server-airbnb",
                        "--ignore-robots-txt"
                    ]
                }
            }
        }
        
    async def create_agent(self):
        # We create a new client and agent for each session to ensure isolation
        # In a production app, we might pool these or manage them more efficiently
        client = MCPClient.from_dict(self.config)
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            api_key=self.api_key,
            temperature=0,
            max_output_tokens=8192
        )
        
        agent = MCPAgent(llm=llm, client=client, max_steps=10)
        return agent, client
