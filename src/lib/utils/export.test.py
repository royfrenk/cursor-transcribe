import pytest
from src.lib.utils.export import (
    format_timestamp,
    export_to_txt,
    export_to_srt,
    export_to_vtt,
    export_to_json,
    export_transcription
)

def test_format_timestamp():
    # Test with zero seconds
    assert format_timestamp(0) == "00:00:00,000"
    
    # Test with minutes and seconds
    assert format_timestamp(65.5) == "00:01:05,500"
    
    # Test with hours
    assert format_timestamp(3661.123) == "01:01:01,123"

def test_export_to_txt():
    # Test data
    transcription = {
        "text": "Hello world.",
        "speakers": [
            {"speaker_id": "Speaker 1", "text": "Hello"},
            {"speaker_id": "Speaker 2", "text": "world."}
        ],
        "summary": "A greeting exchange",
        "key_points": "1. Speaker 1 said hello\n2. Speaker 2 responded"
    }
    
    result = export_to_txt(transcription)
    
    assert "Hello world." in result
    assert "Speaker 1: Hello" in result
    assert "Speaker 2: world." in result
    assert "A greeting exchange" in result
    assert "1. Speaker 1 said hello" in result

def test_export_to_srt():
    # Test data
    transcription = {
        "segments": [
            {"text": "Hello", "start": 0.0, "end": 1.0},
            {"text": "world.", "start": 1.0, "end": 2.0}
        ],
        "speakers": [
            {"speaker_id": "Speaker 1", "text": "Hello", "start": 0.0, "end": 1.0},
            {"speaker_id": "Speaker 2", "text": "world.", "start": 1.0, "end": 2.0}
        ]
    }
    
    result = export_to_srt(transcription)
    
    assert "1" in result
    assert "00:00:00,000 --> 00:00:01,000" in result
    assert "Speaker 1: Hello" in result
    assert "2" in result
    assert "00:00:01,000 --> 00:00:02,000" in result
    assert "Speaker 2: world." in result

def test_export_to_vtt():
    # Test data
    transcription = {
        "segments": [
            {"text": "Hello", "start": 0.0, "end": 1.0},
            {"text": "world.", "start": 1.0, "end": 2.0}
        ],
        "speakers": [
            {"speaker_id": "Speaker 1", "text": "Hello", "start": 0.0, "end": 1.0},
            {"speaker_id": "Speaker 2", "text": "world.", "start": 1.0, "end": 2.0}
        ]
    }
    
    result = export_to_vtt(transcription)
    
    assert "WEBVTT" in result
    assert "00:00:00.000 --> 00:00:01.000" in result
    assert "Speaker 1: Hello" in result
    assert "00:00:01.000 --> 00:00:02.000" in result
    assert "Speaker 2: world." in result

def test_export_to_json():
    # Test data
    transcription = {
        "text": "Hello world.",
        "language": "en"
    }
    
    result = export_to_json(transcription)
    
    assert '"text": "Hello world."' in result
    assert '"language": "en"' in result

def test_export_transcription():
    # Test data
    transcription = {
        "text": "Hello world.",
        "segments": [
            {"text": "Hello", "start": 0.0, "end": 1.0},
            {"text": "world.", "start": 1.0, "end": 2.0}
        ]
    }
    
    # Test TXT format
    txt_result = export_transcription(transcription, "txt")
    assert "Hello world." in txt_result
    
    # Test SRT format
    srt_result = export_transcription(transcription, "srt")
    assert "00:00:00,000 --> 00:00:01,000" in srt_result
    
    # Test VTT format
    vtt_result = export_transcription(transcription, "vtt")
    assert "WEBVTT" in vtt_result
    
    # Test JSON format
    json_result = export_transcription(transcription, "json")
    assert '"text": "Hello world."' in json_result
    
    # Test invalid format
    with pytest.raises(ValueError) as exc_info:
        export_transcription(transcription, "invalid")
    assert "Unsupported export format" in str(exc_info.value) 