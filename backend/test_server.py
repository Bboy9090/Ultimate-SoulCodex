"""Quick test script for Soul Codex backend"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Soul Codex Backend...")
    print("📍 Server will be at: http://localhost:8000")
    print("📍 Health check: http://localhost:8000/health")
    print("📍 API docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
