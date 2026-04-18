from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter
from core.config import FRONTEND_URL, ALLOWED_ORIGINS
import warnings

# Suppress warnings about future deprecations to keep logs clean
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

# Routers
from routes.onboarding import router as onboarding_router
from routes.learning import router as learning_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.agents import router as agents_router
from routes.profiling import router as profiling_router
from routes.curriculum import router as curriculum_router
from routes.assessment import router as assessment_router
from routes.mentor import router as mentor_router
from routes.analytics import router as analytics_router
from routes.achievements import router as achievements_router
from routes.lab import router as lab_router
from routes.content_gen import router as content_gen_router

app = FastAPI(
    title="Agentic AI Backend",
    version="1.0.0"
)

# Initialize Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(onboarding_router, prefix="/api/onboarding", tags=["Onboarding"])
app.include_router(learning_router, prefix="/api/learn", tags=["Learning"])
app.include_router(profiling_router, prefix="/api/profiling", tags=["Profiling"])
app.include_router(curriculum_router, prefix="/api/curriculum", tags=["Curriculum"])
app.include_router(assessment_router, prefix="/api/assessment", tags=["Assessment"])
app.include_router(mentor_router, prefix="/api/mentor", tags=["Mentor"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(achievements_router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(lab_router, prefix="/api/lab", tags=["Lab"])
app.include_router(content_gen_router, prefix="/api/lab", tags=["ContentGen"])
app.include_router(assessment_router, prefix="/api/assessment", tags=["Assessment"])
app.include_router(agents_router, tags=["Agents"])

from fastapi.staticfiles import StaticFiles
from routes.certificate_routes import router as certificate_router
import os

# Create static dir if not exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(certificate_router, prefix="/api/certificates", tags=["Certificates"])

from fastapi.responses import HTMLResponse

@app.get("/", tags=["Health"])
def health():
    return HTMLResponse(content=f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduVerse API | System Live</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
            :root {{
                --bg: #030712;
                --primary: #10b981;
                --secondary: #3b82f6;
                --accent: #f59e0b;
                --text: #f3f4f6;
                --muted: #9ca3af;
                --card-bg: rgba(17, 24, 39, 0.7);
            }}

            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            
            body {{
                font-family: 'Outfit', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }}

            .aurora {{
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: 
                    radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 40%);
                z-index: -1;
                filter: blur(100px);
                animation: drift 20s infinite alternate linear;
            }}

            @keyframes drift {{
                from {{ transform: scale(1); }}
                to {{ transform: scale(1.2) rotate(5deg); }}
            }}

            .container {{
                background: var(--card-bg);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 3rem;
                border-radius: 2rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                text-align: center;
                max-width: 500px;
                width: 90%;
            }}

            .badge {{
                display: inline-flex;
                align-items: center;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                color: var(--primary);
                padding: 0.5rem 1rem;
                border-radius: 2rem;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
            }}

            .dot {{
                width: 8px;
                height: 8px;
                background-color: var(--primary);
                border-radius: 50%;
                margin-right: 8px;
                box-shadow: 0 0 10px var(--primary);
                animation: pulse 2s infinite;
            }}

            @keyframes pulse {{
                0% {{ opacity: 1; transform: scale(1); }}
                50% {{ opacity: 0.5; transform: scale(0.8); }}
                100% {{ opacity: 1; transform: scale(1); }}
            }}

            h1 {{
                font-size: 2.5rem;
                font-weight: 600;
                margin-bottom: 1rem;
                background: linear-gradient(to right, #fff, var(--muted));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }}

            p {{
                color: var(--muted);
                line-height: 1.6;
                margin-bottom: 2rem;
            }}

            .actions {{
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }}

            .btn {{
                text-decoration: none;
                padding: 1rem 2rem;
                border-radius: 1rem;
                font-weight: 600;
                transition: all 0.3s ease;
            }}

            .btn-primary {{
                background: var(--primary);
                color: var(--bg);
            }}

            .btn-primary:hover {{
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
                filter: brightness(1.1);
            }}

            .btn-outline {{
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text);
            }}

            .btn-outline:hover {{
                background: rgba(255, 255, 255, 0.05);
            }}

            .footer-links {{
                margin-top: 2rem;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.3);
            }}
        </style>
    </head>
    <body>
        <div class="aurora"></div>
        <div class="container">
            <div class="badge">
                <div class="dot"></div>
                SYSTEM LIVE
            </div>
            <h1>EduVerse API</h1>
            <p>The agentic intelligence core of your personalized learning journey is active and responding.</p>
            
            <div class="actions">
                <a href="/docs" class="btn btn-primary">Explorer Documentation</a>
                <a href="/debug/routes" class="btn btn-outline">Check Endpoints</a>
            </div>

            <div class="footer-links">
                NODE_ENV: PRODUCTION | VERSION: 1.0.0
            </div>
        </div>
    </body>
    </html>
    """)

@app.get("/debug/routes", tags=["Debug"])
def list_routes():
    return [
        {"path": route.path, "methods": list(route.methods)}
        for route in app.routes
    ]
