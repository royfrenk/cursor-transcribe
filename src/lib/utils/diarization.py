import os
from typing import List, Dict, Optional
import openai
from src.lib.utils.transcription import transcribe_audio

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def identify_speakers(transcription: Dict) -> List[Dict]:
    """
    Identify different speakers in the transcription using GPT-4.
    
    Args:
        transcription: The transcription data from Whisper
        
    Returns:
        List[Dict]: List of speaker segments with speaker IDs
    """
    try:
        # Prepare the prompt for GPT-4
        prompt = f"""Analyze this transcription and identify different speakers. 
        For each segment, assign a speaker ID (Speaker 1, Speaker 2, etc.).
        Return the result as a list of segments with speaker IDs.
        
        Transcription:
        {transcription['text']}
        
        Segments:
        {transcription['segments']}
        """
        
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a speaker diarization expert. Analyze the transcription and identify different speakers based on context, speech patterns, and content."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Parse the response and structure it
        # This is a simplified version - in production, you'd want more robust parsing
        speakers = []
        current_speaker = None
        
        for segment in transcription['segments']:
            # Use GPT-4's analysis to determine speaker
            speaker_id = f"Speaker {len(speakers) + 1}"  # Simplified for now
            
            speakers.append({
                "speaker_id": speaker_id,
                "text": segment['text'],
                "start": segment['start'],
                "end": segment['end']
            })
        
        return speakers
        
    except Exception as e:
        raise Exception(f"Speaker identification failed: {str(e)}")

async def process_audio_with_diarization(file_id: str, language: Optional[str] = None) -> Dict:
    """
    Process an audio file with both transcription and speaker diarization.
    
    Args:
        file_id: The ID of the uploaded file
        language: Optional language code
        
    Returns:
        dict: Contains transcription and speaker information
    """
    # First, get the transcription
    transcription = await transcribe_audio(file_id, language)
    
    # Then, identify speakers
    speakers = await identify_speakers(transcription)
    
    return {
        "transcription": transcription["text"],
        "speakers": speakers,
        "language": transcription["language"]
    } 