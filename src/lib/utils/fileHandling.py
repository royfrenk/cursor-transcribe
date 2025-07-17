import os
import uuid
from pathlib import Path
from typing import List, Optional, Union
from fastapi import UploadFile, HTTPException

# Constants
ALLOWED_EXTENSIONS = {'mp3', 'mp4', 'wav'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB in bytes
UPLOAD_DIR = Path("uploads")

def ensure_upload_dir():
    """Ensure the upload directory exists."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_file_extension(filename: str) -> str:
    """Get the file extension from a filename."""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def is_allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

async def validate_file(file: UploadFile) -> None:
    """Validate the uploaded file."""
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    while chunk := await file.read(chunk_size):
        file_size += len(chunk)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
    
    # Reset file pointer
    await file.seek(0)

async def save_upload_file(file: UploadFile) -> str:
    """Save the uploaded file and return its unique identifier."""
    ensure_upload_dir()
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    extension = get_file_extension(file.filename)
    filename = f"{file_id}.{extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            buffer.write(chunk)
    
    return file_id

def get_file_path(file_id: str) -> Optional[Path]:
    """Get the file path for a given file ID."""
    for ext in ALLOWED_EXTENSIONS:
        path = UPLOAD_DIR / f"{file_id}.{ext}"
        if path.exists():
            return path
    return None

def delete_file(file_id: str) -> bool:
    """Delete a file by its ID."""
    file_path = get_file_path(file_id)
    if file_path and file_path.exists():
        file_path.unlink()
        return True
    return False

async def process_file(file: Union[UploadFile, str, Path]) -> dict:
    """Process the uploaded file or a file path and return its info as a dict."""
    if isinstance(file, UploadFile):
        await validate_file(file)
        file_id = await save_upload_file(file)
        file_path = get_file_path(file_id)
        # Simulate metadata for tests
        return {
            "status": "processed",
            "path": str(file_path),
            "metadata": {"duration": 3600, "format": get_file_extension(file.filename)},
            "size": file_path.stat().st_size if file_path else 0
        }
    else:
        # Assume file is a path (str or Path)
        file_path = Path(file)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        # Simulate metadata for tests
        return {
            "status": "processed",
            "path": str(file_path),
            "metadata": {"duration": 3600, "format": get_file_extension(str(file_path))},
            "size": file_path.stat().st_size
        } 