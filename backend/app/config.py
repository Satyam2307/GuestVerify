import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Locate project base directory and .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
dotenv_path = BASE_DIR / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "GuestVerify"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "AI-assisted smart-home security and visitor verification gatekeeper for smart doorbells"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production").lower()
    
    # AWS / Bedrock settings (stored securely in server environment, never exposed to client)
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    BEDROCK_MODEL_ID: str = os.getenv(
        "BEDROCK_MODEL_ID",
        "anthropic.claude-3-haiku-20240307-v1:0"
    )
    
    # Security, Auth & Demo modes
    RING_WEBHOOK_TOKEN: str = os.getenv("RING_WEBHOOK_TOKEN", "demo-token")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "")
    
    # Allowed CORS Origins
    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv("ALLOWED_ORIGINS", "")
        if raw:
            return [o.strip() for o in raw.split(",") if o.strip()]
        # Default safe set of local and production origins
        return [
            self.FRONTEND_ORIGIN,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8000",
            "https://guestverify.ai",
            "https://www.guestverify.ai"
        ]

    # Paths
    BASE_DIR: Path = BASE_DIR
    DELIVERIES_FILE: Path = BASE_DIR / "deliveries.json"
    DIST_DIR: Path = BASE_DIR / "frontend" / "dist"

    def is_production(self) -> bool:
        return self.ENVIRONMENT in ("production", "prod")

settings = Settings()
