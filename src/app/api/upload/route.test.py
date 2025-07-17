import pytest
from fastapi.testclient import TestClient
from src.app.main import app
from src.lib.utils.fileHandling import UPLOAD_DIR

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    # Setup
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Teardown
    for file in UPLOAD_DIR.glob("*"):
        file.unlink()
    UPLOAD_DIR.rmdir()

def test_upload_valid_file(client):
    # Create a test file
    test_content = b"test content"
    files = {
        "file": ("test.mp3", test_content, "audio/mpeg")
    }
    
    response = client.post("/api/upload/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "file_id" in data
    assert data["status"] == "uploaded"
    
    # Verify file was saved
    file_path = UPLOAD_DIR / f"{data['file_id']}.mp3"
    assert file_path.exists()
    assert file_path.read_bytes() == test_content

def test_upload_invalid_extension(client):
    files = {
        "file": ("test.txt", b"test content", "text/plain")
    }
    
    response = client.post("/api/upload/upload", files=files)
    
    assert response.status_code == 400
    assert "File type not allowed" in response.json()["detail"]

def test_upload_no_file(client):
    response = client.post("/api/upload/upload")
    
    assert response.status_code == 422  # FastAPI validation error 