from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import create_tables
from app.routers import auth, users, projects, tasks

app = FastAPI(
    title="TaskFlow API",
    description="Team Task Manager — role-based access, projects, tasks & dashboard",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    create_tables()

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "TaskFlow API", "docs": "/api/docs", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}