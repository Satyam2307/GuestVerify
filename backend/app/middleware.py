import time
from collections import defaultdict
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

class RateLimiter:
    """In-memory sliding window rate limiter per client IP."""
    def __init__(self):
        # ip -> list of request timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)
        # Specific path limits (path_prefix, max_requests, window_seconds)
        self.path_limits: List[Tuple[str, int, int]] = [
            ("/api/v1/contact", 10, 60),      # 10 contact submissions per minute
            ("/api/v1/ring-webhook", 60, 60), # 60 ring events per minute
            ("/api/v1/schedules", 30, 60),   # 30 schedule updates per minute
        ]
        self.default_api_limit = (200, 60)   # 200 general requests per minute

    def is_rate_limited(self, ip: str, path: str) -> bool:
        now = time.time()
        # Find matching limit
        max_reqs, window = self.default_api_limit
        for prefix, limit, win in self.path_limits:
            if path.startswith(prefix):
                max_reqs, window = limit, win
                break

        key = f"{ip}:{prefix if 'prefix' in locals() else 'api'}"
        timestamps = self.requests[key]

        # Evict timestamps outside window
        cutoff = now - window
        valid_timestamps = [t for t in timestamps if t > cutoff]
        self.requests[key] = valid_timestamps

        if len(valid_timestamps) >= max_reqs:
            return True

        self.requests[key].append(now)
        return False

rate_limiter = RateLimiter()

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Block access to sensitive paths or hidden files
        path = request.url.path.lower()
        blocked_extensions = (".env", ".git", ".db", ".sqlite", ".pem", ".key", ".py", ".log")
        if any(path.endswith(ext) or f"{ext}/" in path for ext in blocked_extensions):
            return JSONResponse(
                status_code=403,
                content={"detail": "Access to restricted file or directory is forbidden."}
            )

        # 2. Rate limiting check on API endpoints
        if path.startswith("/api/"):
            client_ip = request.client.host if request.client else "127.0.0.1"
            if rate_limiter.is_rate_limited(client_ip, path):
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Too Many Requests",
                        "detail": "Rate limit threshold reached. Please wait before retrying."
                    },
                    headers={"Retry-After": "60"}
                )

        response: Response = await call_next(request)

        # 3. Add Comprehensive Security Headers (Padlock, Clickjacking, MIME sniffing, XSS, CSP)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        # CSP allowing fonts and local scripts
        response.headers["Content-Security-Policy"] = (
            "default-src 'self' 'unsafe-inline' data: blob: https://fonts.googleapis.com https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' ws: wss: http: https:;"
        )

        # Disable cache on API responses
        if path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"

        return response
