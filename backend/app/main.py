from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import users, analysis, auth

app = FastAPI(
    title="Lintara API",
    description="AI-powered code analysis platform designed to help developers identify and fix issues in their code efficiently.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Including all neccessary routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"message": "Welcome to Lintara API"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "lintara-api"}
