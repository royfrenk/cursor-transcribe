from fastapi import APIRouter, UploadFile, File, HTTPException
from src.lib.utils.fileHandling import validate_file, save_upload_file

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload an audio file for transcription.
    
    Args:
        file: The audio file to upload (MP3, MP4, or WAV)
        
    Returns:
        dict: Contains file_id and status
    """
    try:
        # Validate the file
        await validate_file(file)
        
        # Save the file
        file_id = await save_upload_file(file)
        
        return {
            "file_id": file_id,
            "status": "uploaded"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading the file: {str(e)}"
        ) 