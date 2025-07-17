import pytest
from pathlib import Path
from src.lib.utils.fileHandling import process_file
from src.lib.utils.transcription import transcribe_audio
from src.lib.utils.diarization import identify_speakers
from src.lib.utils.summarization import generate_summary
from src.lib.utils.export import export_transcription
import asyncio

@pytest.mark.integration
@pytest.mark.nondestructive
async def test_complete_workflow():
    # Test file upload and processing
    file_path = Path("test.mp3")
    processed_file = await process_file(file_path)
    assert processed_file["status"] == "processed"
    assert "metadata" in processed_file

    # Test transcription
    transcription = await transcribe_audio(processed_file["path"])
    assert transcription["status"] == "completed"
    assert "text" in transcription
    assert "segments" in transcription

    # Test speaker diarization
    diarization = await identify_speakers(transcription["segments"])
    assert "speakers" in diarization
    assert len(diarization["speakers"]) > 0

    # Test summarization
    summary = await generate_summary(transcription["text"])
    assert "summary" in summary
    assert len(summary["summary"]) > 0

    # Test export
    export_formats = ["txt", "srt", "vtt", "pdf", "csv"]
    for format in export_formats:
        export_result = await export_transcription(
            transcription["id"],
            format
        )
        assert export_result["status"] == "completed"
        assert "url" in export_result

@pytest.mark.integration
@pytest.mark.nondestructive
async def test_error_recovery():
    # Test error handling in workflow
    file_path = Path("invalid.mp3")
    
    # Test invalid file handling
    with pytest.raises(Exception):
        await process_file(file_path)

    # Test recovery after error
    file_path = Path("test.mp3")
    processed_file = await process_file(file_path)
    assert processed_file["status"] == "processed"

@pytest.mark.integration
@pytest.mark.nondestructive
async def test_large_file_handling():
    # Test large file processing
    file_path = Path("large.mp3")
    processed_file = await process_file(file_path)
    assert processed_file["status"] == "processed"
    assert processed_file["size"] > 100 * 1024 * 1024  # > 100MB

    # Test chunked processing
    transcription = await transcribe_audio(processed_file["path"])
    assert transcription["status"] == "completed"
    assert len(transcription["segments"]) > 0

@pytest.mark.integration
@pytest.mark.nondestructive
async def test_concurrent_processing():
    # Test multiple files processing
    file_paths = [Path(f"test_{i}.mp3") for i in range(3)]
    
    # Process files concurrently
    results = await asyncio.gather(
        *[process_file(path) for path in file_paths]
    )
    
    # Verify all files were processed
    assert all(result["status"] == "processed" for result in results)

    # Test concurrent transcription
    transcriptions = await asyncio.gather(
        *[transcribe_audio(result["path"]) for result in results]
    )
    
    # Verify all transcriptions completed
    assert all(t["status"] == "completed" for t in transcriptions) 