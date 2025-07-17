import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_transcribe_endpoint_success():
    # Mock transcription response
    mock_transcription = {
        "text": "This is a test transcription.",
        "segments": [
            {"text": "This is", "start": 0, "end": 1},
            {"text": "a test transcription.", "start": 1, "end": 2}
        ],
        "language": "en"
    }
    
    # Mock correction response
    mock_corrected_text = "This is a corrected transcription."
    
    with patch('src.lib.utils.transcription.transcribe_audio') as mock_transcribe, \
         patch('src.lib.utils.transcription.correct_transcription') as mock_correct:
        
        mock_transcribe.return_value = mock_transcription
        mock_correct.return_value = mock_corrected_text
        
        response = client.post(
            "/transcribe/transcribe",
            json={"file_id": "test_file_id", "language": "en"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "transcription_id" in data
        assert "status" in data
        assert "text" in data
        assert "segments" in data
        assert "language" in data
        assert data["status"] == "completed"
        assert data["text"] == mock_corrected_text
        assert data["language"] == "en"

@pytest.mark.asyncio
async def test_transcribe_endpoint_file_not_found():
    with patch('src.lib.utils.transcription.transcribe_audio') as mock_transcribe:
        mock_transcribe.side_effect = ValueError("File not found")
        
        response = client.post(
            "/transcribe/transcribe",
            json={"file_id": "nonexistent_file_id"}
        )
        
        assert response.status_code == 404
        assert "File not found" in response.json()["detail"]

@pytest.mark.asyncio
async def test_transcribe_endpoint_transcription_error():
    with patch('src.lib.utils.transcription.transcribe_audio') as mock_transcribe:
        mock_transcribe.side_effect = Exception("Transcription failed")
        
        response = client.post(
            "/transcribe/transcribe",
            json={"file_id": "test_file_id"}
        )
        
        assert response.status_code == 500
        assert "Transcription failed" in response.json()["detail"]

@pytest.mark.asyncio
async def test_transcribe_endpoint_invalid_request():
    response = client.post(
        "/transcribe/transcribe",
        json={"invalid_field": "test"}
    )
    
    assert response.status_code == 422  # Validation error 