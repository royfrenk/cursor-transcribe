from typing import Dict, List, Optional
from datetime import timedelta
from pathlib import Path
import json

def format_timestamp(seconds: float) -> str:
    """
    Format seconds into HH:MM:SS,mmm format.
    
    Args:
        seconds: Time in seconds
        
    Returns:
        str: Formatted timestamp
    """
    time = timedelta(seconds=seconds)
    hours = int(time.total_seconds() // 3600)
    minutes = int((time.total_seconds() % 3600) // 60)
    seconds = time.total_seconds() % 60
    milliseconds = int((seconds % 1) * 1000)
    seconds = int(seconds)
    
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def export_to_txt(transcription: Dict) -> str:
    """
    Export transcription to plain text format.
    
    Args:
        transcription: Dictionary containing transcription data
        
    Returns:
        str: Formatted text content
    """
    text = []
    
    # Add transcription text
    text.append(transcription["text"])
    text.append("\n")
    
    # Add speaker information if available
    if "speakers" in transcription:
        text.append("\nSpeaker Information:")
        for speaker in transcription["speakers"]:
            text.append(f"{speaker['speaker_id']}: {speaker['text']}")
    
    # Add summary if available
    if "summary" in transcription:
        text.append("\nSummary:")
        text.append(transcription["summary"])
    
    # Add key points if available
    if "key_points" in transcription:
        text.append("\nKey Points:")
        text.append(transcription["key_points"])
    
    return "\n".join(text)

def export_to_srt(transcription: Dict) -> str:
    """
    Export transcription to SRT format.
    
    Args:
        transcription: Dictionary containing transcription data
        
    Returns:
        str: Formatted SRT content
    """
    srt = []
    
    for i, segment in enumerate(transcription["segments"], 1):
        # Format timestamps
        start_time = format_timestamp(segment["start"])
        end_time = format_timestamp(segment["end"])
        
        # Add speaker information if available
        speaker_text = ""
        if "speakers" in transcription:
            for speaker in transcription["speakers"]:
                if speaker["start"] == segment["start"] and speaker["end"] == segment["end"]:
                    speaker_text = f"{speaker['speaker_id']}: "
                    break
        
        # Create SRT entry
        srt.extend([
            str(i),
            f"{start_time} --> {end_time}",
            f"{speaker_text}{segment['text']}",
            ""
        ])
    
    return "\n".join(srt)

def export_to_vtt(transcription: Dict) -> str:
    """
    Export transcription to WebVTT format.
    
    Args:
        transcription: Dictionary containing transcription data
        
    Returns:
        str: Formatted VTT content
    """
    vtt = ["WEBVTT", ""]
    
    for segment in transcription["segments"]:
        # Format timestamps (VTT uses . instead of , for milliseconds)
        start_time = format_timestamp(segment["start"]).replace(",", ".")
        end_time = format_timestamp(segment["end"]).replace(",", ".")
        
        # Add speaker information if available
        speaker_text = ""
        if "speakers" in transcription:
            for speaker in transcription["speakers"]:
                if speaker["start"] == segment["start"] and speaker["end"] == segment["end"]:
                    speaker_text = f"{speaker['speaker_id']}: "
                    break
        
        # Create VTT entry
        vtt.extend([
            f"{start_time} --> {end_time}",
            f"{speaker_text}{segment['text']}",
            ""
        ])
    
    return "\n".join(vtt)

def export_to_json(transcription: Dict) -> str:
    """
    Export transcription to JSON format.
    
    Args:
        transcription: Dictionary containing transcription data
        
    Returns:
        str: JSON formatted content
    """
    return json.dumps(transcription, indent=2)

def export_transcription(transcription: Dict, format: str) -> str:
    """
    Export transcription to the specified format.
    
    Args:
        transcription: Dictionary containing transcription data
        format: Export format (txt, srt, vtt, json)
        
    Returns:
        str: Formatted content in the specified format
        
    Raises:
        ValueError: If the format is not supported
    """
    format = format.lower()
    
    if format == "txt":
        return export_to_txt(transcription)
    elif format == "srt":
        return export_to_srt(transcription)
    elif format == "vtt":
        return export_to_vtt(transcription)
    elif format == "json":
        return export_to_json(transcription)
    else:
        raise ValueError(f"Unsupported export format: {format}") 