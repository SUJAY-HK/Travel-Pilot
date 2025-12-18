import asyncio
import os
from dotenv import load_dotenv

# from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from mcp_use import MCPAgent, MCPClient

async def main():
    # Load environment variables (ensure GOOGLE_API_KEY is in your .env)
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    # Create configuration dictionary
    config = {
    
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

    # Create MCPClient from configuration dictionary
    client = MCPClient.from_dict(config)

    # 2. CHANGE: Initialize Groq LLM
    # We use temperature=0 to make tool selection more reliable
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=api_key,
        temperature=0,
        # This prevents the model from choking on large tool outputs
        max_output_tokens=8192 
    )

    # Create agent with the client
    # Note: Ensure the model you choose supports the context size required for the webpage content
    agent = MCPAgent(llm=llm, client=client, max_steps=30)

    # Run the query
    print("Running agent...")
    result = await agent.run(
        "Find accomodations in Bangalore, Karnataka, India on Airbnb for under ₹3000 a night.",
    )
    print(f"\nResult: {result}")

if __name__ == "__main__":
    asyncio.run(main())