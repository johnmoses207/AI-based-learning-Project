from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

@app.get("/", tags=["Health"])
def health():
    return {"status": "Backend running 🚀"}
@app.get("/debug/routes", tags=["Debug"])
def list_routes():
    return [
        {"path": route.path, "methods": list(route.methods)}
        for route in app.routes
    ]
