import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_export_endpoint_success():
    # Mock transcription data
    mock_data = {
        "text": "Hello world.",
        "segments": [
            {"text": "Hello", "start": 0.0, "end": 1.0},
            {"text": "world.", "start": 1.0, "end": 2.0}
        ],
        "language": "en"
    }
    
    with patch('src.lib.utils.diarization.process_audio_with_diarization') as mock_process:
        mock_process.return_value = mock_data
        
        response = client.post(
            "/export/",
            json={
                "file_id": "test_file_id",
                "format": "txt",
                "include_summary": False,
                "language": "en"
            }
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/plain"
        assert "attachment" in response.headers["content-disposition"]
        assert "transcription_test_file_id.txt" in response.headers["content-disposition"]
        assert "Hello world." in response.text

@pytest.mark.asyncio
async def test_export_endpoint_with_summary():
    # Mock transcription data with summary
    mock_data = {
        "text": "Hello world.",
        "segments": [
            {"text": "Hello", "start": 0.0, "end": 1.0},
            {"text": "world.", "start": 1.0, "end": 2.0}
        ],
        "language": "en",
        "summary": "A greeting",
        "key_points": "1. Hello\n2. World"
    }
    
    with patch('src.lib.utils.summarization.process_with_summary') as mock_process:
        mock_process.return_value = mock_data
        
        response = client.post(
            "/export/",
            json={
                "file_id": "test_file_id",
                "format": "txt",
                "include_summary": True,
                "language": "en"
            }
        )
        
        assert response.status_code == 200
        assert "Hello world." in response.text
        assert "A greeting" in response.text
        assert "1. Hello" in response.text

@pytest.mark.asyncio
async def test_export_endpoint_srt_format():
    # Mock transcription data
    mock_data = {
        "text": "Hello world.",
        "segments": [
            {"text": "Hello", "start": 0.0, "end": 1.0},
            {"text": "world.", "start": 1.0, "end": 2.0}
        ],
        "language": "en"
    }
    
    with patch('src.lib.utils.diarization.process_audio_with_diarization') as mock_process:
        mock_process.return_value = mock_data
        
        response = client.post(
            "/export/",
            json={
                "file_id": "test_file_id",
                "format": "srt",
                "include_summary": False
            }
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/plain"
        assert "transcription_test_file_id.srt" in response.headers["content-disposition"]
        assert "00:00:00,000 --> 00:00:01,000" in response.text

@pytest.mark.asyncio
async def test_export_endpoint_invalid_format():
    with patch('src.lib.utils.diarization.process_audio_with_diarization') as mock_process:
        mock_process.return_value = {"text": "Hello world."}
        
        response = client.post(
            "/export/",
            json={
                "file_id": "test_file_id",
                "format": "invalid",
                "include_summary": False
            }
        )
        
        assert response.status_code == 400
        assert "Unsupported export format" in response.json()["detail"]

@pytest.mark.asyncio
async def test_export_endpoint_processing_error():
    with patch('src.lib.utils.diarization.process_audio_with_diarization') as mock_process:
        mock_process.side_effect = Exception("Processing failed")
        
        response = client.post(
            "/export/",
            json={
                "file_id": "test_file_id",
                "format": "txt",
                "include_summary": False
            }
        )
        
        assert response.status_code == 500
        assert "Processing failed" in response.json()["detail"]

@pytest.mark.asyncio
async def test_export_endpoint_invalid_request():
    response = client.post(
        "/export/",
        json={"invalid_field": "test"}
    )
    
    assert response.status_code == 422  # Validation error 