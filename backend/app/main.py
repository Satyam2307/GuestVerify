import os
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse, Response

from .config import settings
from .middleware import SecurityHeadersMiddleware
from .routers import ring, schedules, events, stream, health, contact

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. Security Headers & Rate Limiting Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Strict CORS Configuration (restricted to verified domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 3. Register Core API Routers
app.include_router(ring.router)
app.include_router(schedules.router)
app.include_router(events.router)
app.include_router(stream.router)
app.include_router(health.router)
app.include_router(contact.router)

# 4. Production Static Web Assets & SPA Serving
DIST_DIR = settings.DIST_DIR
PUBLIC_DIR = settings.BASE_DIR / "frontend" / "public"

@app.get("/robots.txt", response_class=PlainTextResponse)
async def serve_robots():
    path = DIST_DIR / "robots.txt" if (DIST_DIR / "robots.txt").exists() else PUBLIC_DIR / "robots.txt"
    if path.exists():
        return FileResponse(path, media_type="text/plain")
    return PlainTextResponse("User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://guestverify.ai/sitemap.xml")

@app.get("/sitemap.xml")
async def serve_sitemap():
    path = DIST_DIR / "sitemap.xml" if (DIST_DIR / "sitemap.xml").exists() else PUBLIC_DIR / "sitemap.xml"
    if path.exists():
        return FileResponse(path, media_type="application/xml")
    raise HTTPException(status_code=404, detail="Sitemap not found")

@app.get("/llms.txt", response_class=PlainTextResponse)
async def serve_llms():
    path = DIST_DIR / "llms.txt" if (DIST_DIR / "llms.txt").exists() else PUBLIC_DIR / "llms.txt"
    if path.exists():
        return FileResponse(path, media_type="text/plain")
    raise HTTPException(status_code=404, detail="llms.txt not found")

@app.get("/favicon.svg")
async def serve_favicon():
    path = DIST_DIR / "favicon.svg" if (DIST_DIR / "favicon.svg").exists() else PUBLIC_DIR / "favicon.svg"
    if path.exists():
        return FileResponse(path, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Favicon not found")

@app.get("/og-image.svg")
async def serve_og_image():
    path = DIST_DIR / "og-image.svg" if (DIST_DIR / "og-image.svg").exists() else PUBLIC_DIR / "og-image.svg"
    if path.exists():
        return FileResponse(path, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="OG image not found")

if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
    # Mount frontend static assets
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(DIST_DIR / "index.html")

    # SPA catch-all route for client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # API or health 404 should never fall back to index.html
        if full_path.startswith("api/") or full_path == "api" or full_path.startswith("health"):
            raise HTTPException(status_code=404, detail="API resource not found")

        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
            
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/")
    async def root_fallback():
        return {
            "status": "online",
            "message": "GuestVerify API is running with zero-trust security and rate-limiting enabled.",
            "health": "/health",
            "docs": "/docs",
            "sitemap": "/sitemap.xml",
            "robots": "/robots.txt",
            "llms": "/llms.txt"
        }
