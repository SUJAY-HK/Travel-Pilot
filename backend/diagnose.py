import os
import sys
import shutil
from dotenv import load_dotenv

def check_setup():
    print("--- Diagnostic Start ---")
    
    # 1. Check .env
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_API_KEY is missing or empty in .env")
    else:
        print(f"✅ GOOGLE_API_KEY found (length: {len(api_key)})")

    # 2. Check npx
    npx_path = shutil.which("npx")
    if npx_path:
        print(f"✅ npx found at: {npx_path}")
    else:
        print("❌ npx not found in PATH")

    # 3. Check imports
    try:
        from mcp_use import MCPAgent, MCPClient
        print("✅ mcp-use imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import mcp-use: {e}")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        print("✅ langchain-google-genai imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import langchain-google-genai: {e}")

    print("--- Diagnostic End ---")

if __name__ == "__main__":
    check_setup()