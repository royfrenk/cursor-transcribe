import os
from pathlib import Path
from typing import Dict, List, Optional
import openai
from src.lib.utils.fileHandling import get_file_path
from Levenshtein import distance

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def transcribe_audio(file_id: str, language: Optional[str] = None) -> Dict:
    """
    Transcribe an audio file using Whisper.
    
    Args:
        file_id: The ID of the uploaded file
        language: Optional language code (e.g., 'en', 'es', 'fr')
        
    Returns:
        dict: Contains transcription text and metadata
    """
    file_path = get_file_path(file_id)
    if not file_path:
        raise ValueError(f"File not found for ID: {file_id}")
    
    try:
        with open(file_path, "rb") as audio_file:
            # Prepare transcription options
            options = {
                "model": "whisper-1",
                "file": audio_file,
                "response_format": "verbose_json"
            }
            
            # Add language if specified
            if language:
                options["language"] = language
            
            # Call Whisper API
            response = await client.audio.transcriptions.create(**options)
            
            return {
                "text": response.text,
                "segments": response.segments,
                "language": response.language
            }
            
    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")

async def correct_transcription(text: str) -> str:
    """
    Review and correct transcription errors using GPT-4.
    
    Args:
        text: The transcribed text to correct
        
    Returns:
        str: Corrected text
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a transcription correction expert. Review the text and fix any obvious transcription errors while maintaining the original meaning."},
                {"role": "user", "content": f"Please review and correct this transcription:\n\n{text}"}
            ]
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        raise Exception(f"Transcription correction failed: {str(e)}")

def chunk_audio(file_path: Path, chunk_size: int = 25 * 1024 * 1024) -> List[Path]:
    """
    Split large audio files into smaller chunks for processing.
    
    Args:
        file_path: Path to the audio file
        chunk_size: Size of each chunk in bytes (default: 25MB)
        
    Returns:
        List[Path]: List of paths to chunk files
    """
    # TODO: Implement audio chunking
    # This would require additional audio processing libraries
    # For now, we'll return the original file
    return [file_path]

class TranscriptionError(Exception):
    """Custom exception for transcription errors."""
    pass

def calculate_accuracy(original_text: str, transcribed_text: str) -> float:
    """Calculate the accuracy of the transcription compared to the original text."""
    # Simple implementation using Levenshtein distance
    max_len = max(len(original_text), len(transcribed_text))
    if max_len == 0:
        return 1.0
    return 1 - (distance(original_text, transcribed_text) / max_len) 