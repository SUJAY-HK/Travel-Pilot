import asyncio
import os
import json
from pprint import pformat
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

    # Initialize Gemini LLM
    # We use temperature=0 to make tool selection more reliable
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=api_key,
        temperature=0,
        # This prevents the model from choking on large tool outputs
        max_output_tokens=8192 
    )

    # Create agent with the client
    agent = MCPAgent(llm=llm, client=client, max_steps=30)

    # Run the query
    print("Running agent...")
    result = await agent.run(
        "Find villas in Bali",
    )

    def format_result(res):
        # bytes -> decode
        if isinstance(res, (bytes, bytearray)):
            try:
                return res.decode("utf-8")
            except Exception:
                return str(res)

        # strings that are JSON -> pretty JSON
        if isinstance(res, str):
            s = res.strip()
            if (s.startswith("{") and s.endswith("}")) or (s.startswith("[") and s.endswith("]")):
                try:
                    obj = json.loads(s)
                    return json.dumps(obj, indent=2, ensure_ascii=False)
                except Exception:
                    return s
            return s

        # dicts/lists -> pretty JSON
        if isinstance(res, (dict, list)):
            try:
                return json.dumps(res, indent=2, ensure_ascii=False)
            except Exception:
                return pformat(res)

        # objects with to_dict
        if hasattr(res, "to_dict") and callable(getattr(res, "to_dict")):
            try:
                return json.dumps(res.to_dict(), indent=2, ensure_ascii=False)
            except Exception:
                return pformat(res.to_dict())

        # generic objects: try __dict__ then pformat
        if hasattr(res, "__dict__"):
            try:
                return json.dumps(res.__dict__, indent=2, ensure_ascii=False)
            except Exception:
                return pformat(res.__dict__)

        # fallback
        try:
            return pformat(res)
        except Exception:
            return str(res)

    print("\nResult:")
    print(format_result(result))

if __name__ == "__main__":
    asyncio.run(main())