import pytest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path
from src.lib.utils.transcription import (
    transcribe_audio,
    detect_language,
    correct_transcription,
    calculate_accuracy,
    TranscriptionError
)

@pytest.mark.asyncio
async def test_transcribe_audio():
    # Mock file path and content
    mock_file_path = Path("test_audio.mp3")
    mock_file_content = b"mock audio content"
    
    # Mock Whisper API response
    mock_response = MagicMock()
    mock_response.text = "This is a test transcription."
    mock_response.segments = [
        {"text": "This is", "start": 0, "end": 1},
        {"text": "a test transcription.", "start": 1, "end": 2}
    ]
    mock_response.language = "en"
    
    with patch('pathlib.Path.exists', return_value=True), \
         patch('builtins.open', mock_open(read_data=mock_file_content)), \
         patch('openai.OpenAI') as mock_openai:
        
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_client.audio.transcriptions.create.return_value = mock_response
        
        result = await transcribe_audio("test_file_id", "en")
        
        assert "text" in result
        assert "segments" in result
        assert "language" in result
        assert result["text"] == "This is a test transcription."
        assert len(result["segments"]) == 2
        assert result["language"] == "en"

@pytest.mark.asyncio
async def test_transcribe_audio_file_not_found():
    with patch('pathlib.Path.exists', return_value=False):
        with pytest.raises(ValueError) as exc_info:
            await transcribe_audio("nonexistent_file_id")
        assert "File not found" in str(exc_info.value)

@pytest.mark.asyncio
async def test_transcribe_audio_api_error():
    with patch('pathlib.Path.exists', return_value=True), \
         patch('builtins.open', mock_open(read_data=b"test")), \
         patch('openai.OpenAI') as mock_openai:
        
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_client.audio.transcriptions.create.side_effect = Exception("API Error")
        
        with pytest.raises(Exception) as exc_info:
            await transcribe_audio("test_file_id")
        assert "Transcription failed" in str(exc_info.value)

@pytest.mark.asyncio
async def test_correct_transcription():
    # Mock GPT-4 response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content="This is a corrected transcription."
            )
        )
    ]
    
    with patch('openai.OpenAI') as mock_openai:
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_client.chat.completions.create.return_value = mock_response
        
        result = await correct_transcription("This is a test transcription.")
        assert result == "This is a corrected transcription."

@pytest.mark.asyncio
async def test_correct_transcription_error():
    with patch('openai.OpenAI') as mock_openai:
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        
        with pytest.raises(Exception) as exc_info:
            await correct_transcription("test transcription")
        assert "Transcription correction failed" in str(exc_info.value)

def test_chunk_audio():
    # Test with a small file (should return original file)
    mock_file_path = Path("test_audio.mp3")
    result = chunk_audio(mock_file_path)
    assert len(result) == 1
    assert result[0] == mock_file_path 

def test_detect_language():
    # Test language detection
    text = "Hello, this is a test."
    language = detect_language(text)
    assert language == "en"

    # Test multiple languages
    text = "Hola, this is a test."
    language = detect_language(text)
    assert language in ["en", "es"]

def test_calculate_accuracy():
    # Test accuracy calculation
    original = "Hello world"
    transcribed = "Hello world"
    accuracy = calculate_accuracy(original, transcribed)
    assert accuracy == 1.0

    # Test with errors
    original = "Hello world"
    transcribed = "Hello wrld"
    accuracy = calculate_accuracy(original, transcribed)
    assert accuracy < 1.0

    # Test with different lengths
    original = "Hello world"
    transcribed = "Hello"
    accuracy = calculate_accuracy(original, transcribed)
    assert accuracy < 1.0 