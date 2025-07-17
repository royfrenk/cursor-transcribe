import os
from typing import Dict, List
import openai

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class SummaryError(Exception):
    """Custom exception for summarization errors."""
    pass

async def generate_summary(transcription: str, speakers: List[Dict]) -> Dict:
    """
    Generate a summary of the transcribed content with speaker attribution.
    
    Args:
        transcription: The full transcription text
        speakers: List of speaker segments
        
    Returns:
        dict: Contains summary and key points
    """
    try:
        # Prepare the prompt for GPT-4
        prompt = f"""Please provide a comprehensive summary of this conversation, 
        highlighting the main points discussed by each speaker. 
        Format the summary to clearly indicate who said what.
        
        Transcription:
        {transcription}
        
        Speakers:
        {speakers}
        """
        
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a content summarization expert. Create clear, concise summaries that maintain the key points and speaker attribution."},
                {"role": "user", "content": prompt}
            ]
        )
        
        summary = response.choices[0].message.content
        
        # Extract key points
        key_points_prompt = f"""Based on this summary, extract the key points discussed:
        
        {summary}
        """
        
        key_points_response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Extract the main key points from the summary, maintaining speaker attribution."},
                {"role": "user", "content": key_points_prompt}
            ]
        )
        
        key_points = key_points_response.choices[0].message.content
        
        return {
            "summary": summary,
            "key_points": key_points
        }
        
    except Exception as e:
        raise Exception(f"Summary generation failed: {str(e)}")

async def process_with_summary(file_id: str, language: str = None) -> Dict:
    """
    Process an audio file with transcription, diarization, and summarization.
    
    Args:
        file_id: The ID of the uploaded file
        language: Optional language code
        
    Returns:
        dict: Contains transcription, speaker information, and summary
    """
    from src.lib.utils.diarization import process_audio_with_diarization
    
    # Get transcription and speaker information
    result = await process_audio_with_diarization(file_id, language)
    
    # Generate summary
    summary_data = await generate_summary(result["transcription"], result["speakers"])
    
    # Combine all results
    return {
        **result,
        "summary": summary_data["summary"],
        "key_points": summary_data["key_points"]
    } 