import sys
from pathlib import Path
import uvicorn

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app

if __name__ == "__main__":
    print("=" * 60)
    print("🛡️  Starting GuestVerify — AI Smart-Home Security Gatekeeper")
    print("📍 Server running at: http://127.0.0.1:8000")
    print("📚 API Documentation: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
