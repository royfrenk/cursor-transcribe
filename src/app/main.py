from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.api.upload.route import router as upload_router
from src.app.api.transcribe.route import router as transcribe_router
from src.app.api.summarize.route import router as summarize_router
from src.app.api.export.route import router as export_router

app = FastAPI(
    title="Podcast Transcription Service",
    description="A service for transcribing and summarizing podcast audio files",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/upload", tags=["upload"])
app.include_router(transcribe_router, prefix="/transcribe", tags=["transcribe"])
app.include_router(summarize_router, prefix="/summarize", tags=["summarize"])
app.include_router(export_router, prefix="/export", tags=["export"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Podcast Transcription Service"} 