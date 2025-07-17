from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from src.lib.utils.export import export_transcription
from src.lib.utils.transcription import transcribe_audio
from src.lib.utils.diarization import process_audio_with_diarization
from src.lib.utils.summarization import process_with_summary

router = APIRouter()

class ExportRequest(BaseModel):
    file_id: str
    format: str
    include_summary: Optional[bool] = False
    language: Optional[str] = None

@router.post("/")
async def export(request: ExportRequest):
    """
    Export transcription in the specified format.
    
    Args:
        request: ExportRequest containing file_id, format, and optional parameters
        
    Returns:
        StreamingResponse: File download response
    """
    try:
        # Get transcription data
        if request.include_summary:
            data = await process_with_summary(request.file_id, request.language)
        else:
            data = await process_audio_with_diarization(request.file_id, request.language)
        
        # Export to requested format
        content = export_transcription(data, request.format)
        
        # Determine content type and file extension
        content_types = {
            "txt": "text/plain",
            "srt": "text/plain",
            "vtt": "text/vtt",
            "json": "application/json"
        }
        
        file_extensions = {
            "txt": ".txt",
            "srt": ".srt",
            "vtt": ".vtt",
            "json": ".json"
        }
        
        content_type = content_types.get(request.format.lower(), "text/plain")
        file_extension = file_extensions.get(request.format.lower(), ".txt")
        
        # Create filename
        filename = f"transcription_{request.file_id}{file_extension}"
        
        # Return file as streaming response
        return StreamingResponse(
            iter([content.encode()]),
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 