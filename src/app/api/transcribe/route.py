from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.lib.utils.transcription import transcribe_audio, correct_transcription

router = APIRouter()

class TranscriptionRequest(BaseModel):
    file_id: str
    language: Optional[str] = None

@router.post("/transcribe")
async def transcribe(request: TranscriptionRequest):
    """
    Transcribe an uploaded audio file.
    
    Args:
        request: Contains file_id and optional language
        
    Returns:
        dict: Contains transcription_id and status
    """
    try:
        # Transcribe the audio
        transcription = await transcribe_audio(request.file_id, request.language)
        
        # Correct any transcription errors
        corrected_text = await correct_transcription(transcription["text"])
        
        return {
            "transcription_id": request.file_id,  # Using file_id as transcription_id for now
            "status": "completed",
            "text": corrected_text,
            "segments": transcription["segments"],
            "language": transcription["language"]
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        ) 