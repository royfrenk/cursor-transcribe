import pytest
from unittest.mock import patch, MagicMock
from src.lib.utils.summarization import generate_summary, process_with_summary

@pytest.mark.asyncio
async def test_generate_summary():
    # Mock transcription and speakers
    mock_transcription = "Speaker 1: Hello. Speaker 2: Hi there."
    mock_speakers = [
        {"speaker": "Speaker 1", "text": "Hello"},
        {"speaker": "Speaker 2", "text": "Hi there"}
    ]
    
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content="A brief conversation between two speakers exchanging greetings."
            )
        )
    ]
    
    # Mock key points response
    mock_key_points_response = MagicMock()
    mock_key_points_response.choices = [
        MagicMock(
            message=MagicMock(
                content="1. Speaker 1 greeted Speaker 2\n2. Speaker 2 responded with a greeting"
            )
        )
    ]
    
    with patch('openai.OpenAI') as mock_openai:
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_client.chat.completions.create.side_effect = [mock_response, mock_key_points_response]
        
        result = await generate_summary(mock_transcription, mock_speakers)
        
        assert "summary" in result
        assert "key_points" in result
        assert isinstance(result["summary"], str)
        assert isinstance(result["key_points"], str)

@pytest.mark.asyncio
async def test_process_with_summary():
    # Mock process_audio_with_diarization response
    mock_diarization_result = {
        "transcription": "Speaker 1: Hello. Speaker 2: Hi there.",
        "speakers": [
            {"speaker": "Speaker 1", "text": "Hello"},
            {"speaker": "Speaker 2", "text": "Hi there"}
        ],
        "language": "en"
    }
    
    # Mock generate_summary response
    mock_summary_data = {
        "summary": "A brief conversation between two speakers exchanging greetings.",
        "key_points": "1. Speaker 1 greeted Speaker 2\n2. Speaker 2 responded with a greeting"
    }
    
    with patch('src.lib.utils.diarization.process_audio_with_diarization') as mock_diarization, \
         patch('src.lib.utils.summarization.generate_summary') as mock_summary:
        
        mock_diarization.return_value = mock_diarization_result
        mock_summary.return_value = mock_summary_data
        
        result = await process_with_summary("test_file_id", "en")
        
        assert "transcription" in result
        assert "speakers" in result
        assert "language" in result
        assert "summary" in result
        assert "key_points" in result
        assert result["language"] == "en"
        assert result["summary"] == mock_summary_data["summary"]
        assert result["key_points"] == mock_summary_data["key_points"]

@pytest.mark.asyncio
async def test_generate_summary_error_handling():
    with patch('openai.OpenAI') as mock_openai:
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        
        with pytest.raises(Exception) as exc_info:
            await generate_summary("test transcription", [])
        
        assert "Summary generation failed" in str(exc_info.value) 