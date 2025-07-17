from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.lib.utils.summarization import process_with_summary

router = APIRouter()

class SummaryRequest(BaseModel):
    file_id: str
    language: Optional[str] = None

@router.post("/")
async def summarize(request: SummaryRequest):
    """
    Generate a summary of the transcribed content.
    
    Args:
        request: SummaryRequest containing file_id and optional language
        
    Returns:
        dict: Contains transcription, speaker information, summary, and key points
    """
    try:
        result = await process_with_summary(request.file_id, request.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 