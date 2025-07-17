import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_summarize_endpoint_success():
    # Mock process_with_summary response
    mock_result = {
        "transcription": "Speaker 1: Hello. Speaker 2: Hi there.",
        "speakers": [
            {"speaker": "Speaker 1", "text": "Hello"},
            {"speaker": "Speaker 2", "text": "Hi there"}
        ],
        "language": "en",
        "summary": "A brief conversation between two speakers exchanging greetings.",
        "key_points": "1. Speaker 1 greeted Speaker 2\n2. Speaker 2 responded with a greeting"
    }
    
    with patch('src.lib.utils.summarization.process_with_summary') as mock_process:
        mock_process.return_value = mock_result
        
        response = client.post(
            "/summarize/",
            json={"file_id": "test_file_id", "language": "en"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "transcription" in data
        assert "speakers" in data
        assert "language" in data
        assert "summary" in data
        assert "key_points" in data
        assert data["language"] == "en"
        assert data["summary"] == mock_result["summary"]
        assert data["key_points"] == mock_result["key_points"]

@pytest.mark.asyncio
async def test_summarize_endpoint_error():
    with patch('src.lib.utils.summarization.process_with_summary') as mock_process:
        mock_process.side_effect = Exception("Processing failed")
        
        response = client.post(
            "/summarize/",
            json={"file_id": "test_file_id"}
        )
        
        assert response.status_code == 500
        assert "Processing failed" in response.json()["detail"]

@pytest.mark.asyncio
async def test_summarize_endpoint_invalid_request():
    response = client.post(
        "/summarize/",
        json={"invalid_field": "test"}
    )
    
    assert response.status_code == 422  # Validation error 