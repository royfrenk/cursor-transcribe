import pytest
from pathlib import Path
from fastapi import UploadFile, HTTPException
from src.lib.utils.fileHandling import (
    ensure_upload_dir,
    get_file_extension,
    is_allowed_file,
    validate_file,
    save_upload_file,
    get_file_path,
    delete_file,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    UPLOAD_DIR
)
from .fileHandling import (
    process_file,
    chunk_file,
    extract_metadata,
    FileValidationError
)

@pytest.fixture
def upload_dir():
    """Fixture to create and clean up upload directory."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield UPLOAD_DIR
    # Cleanup
    for file in UPLOAD_DIR.glob("*"):
        file.unlink()
    UPLOAD_DIR.rmdir()

def test_get_file_extension():
    assert get_file_extension("test.mp3") == "mp3"
    assert get_file_extension("test.MP3") == "mp3"
    assert get_file_extension("test") == ""
    assert get_file_extension("test.") == ""

def test_is_allowed_file():
    assert is_allowed_file("test.mp3")
    assert is_allowed_file("test.mp4")
    assert is_allowed_file("test.wav")
    assert not is_allowed_file("test.txt")
    assert not is_allowed_file("test")

@pytest.mark.asyncio
async def test_validate_file_allowed_extension():
    file = UploadFile(filename="test.mp3", file=open("test.mp3", "wb"))
    try:
        await validate_file(file)
    except HTTPException:
        pytest.fail("validate_file raised HTTPException unexpectedly")

@pytest.mark.asyncio
async def test_validate_file_disallowed_extension():
    file = UploadFile(filename="test.txt", file=open("test.txt", "wb"))
    with pytest.raises(HTTPException) as exc_info:
        await validate_file(file)
    assert exc_info.value.status_code == 400
    assert "File type not allowed" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_save_upload_file(upload_dir):
    # Create a test file
    test_content = b"test content"
    file = UploadFile(filename="test.mp3", file=open("test.mp3", "wb"))
    file.file.write(test_content)
    file.file.seek(0)
    
    # Save the file
    file_id = await save_upload_file(file)
    
    # Check if file exists
    file_path = get_file_path(file_id)
    assert file_path is not None
    assert file_path.exists()
    assert file_path.read_bytes() == test_content

def test_delete_file(upload_dir):
    # Create a test file
    test_file = upload_dir / "test.mp3"
    test_file.write_bytes(b"test content")
    
    # Get file ID from filename
    file_id = test_file.stem
    
    # Delete the file
    assert delete_file(file_id)
    assert not test_file.exists()

def test_get_file_path_nonexistent():
    assert get_file_path("nonexistent") is None

def test_validate_file():
    # Test valid file
    valid_file = Path("test.mp3")
    assert validate_file(valid_file) is True

    # Test invalid file type
    invalid_file = Path("test.txt")
    with pytest.raises(FileValidationError):
        validate_file(invalid_file)

    # Test file size limit
    large_file = Path("large.mp3")
    with pytest.raises(FileValidationError):
        validate_file(large_file, max_size=1)  # 1 byte limit

def test_process_file():
    # Test file processing
    file_path = Path("test.mp3")
    processed = process_file(file_path)
    assert processed["format"] == "mp3"
    assert "duration" in processed
    assert "bitrate" in processed

def test_chunk_file():
    # Test file chunking
    file_path = Path("test.mp3")
    chunks = chunk_file(file_path, chunk_size=1024 * 1024)  # 1MB chunks
    assert len(chunks) > 0
    assert all(len(chunk) <= 1024 * 1024 for chunk in chunks)

def test_extract_metadata():
    # Test metadata extraction
    file_path = Path("test.mp3")
    metadata = extract_metadata(file_path)
    assert "title" in metadata
    assert "artist" in metadata
    assert "duration" in metadata
    assert "format" in metadata 