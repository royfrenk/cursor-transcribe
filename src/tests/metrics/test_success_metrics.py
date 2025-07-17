import pytest
import time
import asyncio
from src.lib.utils.transcription import transcribe_audio, calculate_accuracy
from src.lib.utils.summarization import generate_summary
from src.lib.utils.fileHandling import process_file

@pytest.mark.asyncio
@pytest.mark.nondestructive
async def test_transcription_accuracy():
    # Test accuracy for clear audio
    file_path = "test.mp3"
    transcription = await transcribe_audio(file_path)
    accuracy = calculate_accuracy(
        transcription["text"],
        transcription["reference_text"]
    )
    assert accuracy >= 0.90  # 90% accuracy requirement
    
    # Test accuracy for different languages
    languages = ["en", "es", "fr", "de", "it"]
    for lang in languages:
        transcription = await transcribe_audio(file_path, language=lang)
        accuracy = calculate_accuracy(
            transcription["text"],
            transcription["reference_text"]
        )
        assert accuracy >= 0.90

@pytest.mark.asyncio
@pytest.mark.nondestructive
async def test_large_file_processing():
    # Test processing of 3-hour file
    file_path = "large.mp3"  # 3-hour file
    start_time = time.time()
    
    # Process file
    processed_file = await process_file(file_path)
    process_time = time.time() - start_time
    
    # Verify processing time
    assert process_time < 10800  # 3 hours in seconds
    
    # Verify file was processed correctly
    assert processed_file["status"] == "processed"
    assert "metadata" in processed_file
    assert processed_file["duration"] >= 10800  # 3 hours in seconds

@pytest.mark.asyncio
@pytest.mark.nondestructive
async def test_summary_quality():
    # Test summary quality
    text = """
    The podcast discussed climate change, renewable energy, and policy changes.
    Multiple speakers provided different perspectives on these topics.
    The discussion covered both technical and social aspects of the issues.
    """
    
    summary = await generate_summary(text, speakers=[])
    
    # Verify summary captures key points
    key_points = [
        "climate change",
        "renewable energy",
        "policy changes",
        "multiple speakers",
        "technical",
        "social"
    ]
    
    for point in key_points:
        assert point in summary.lower()
    
    # Verify summary length
    assert len(summary.split()) <= len(text.split()) * 0.3  # 30% of original length

@pytest.mark.asyncio
@pytest.mark.nondestructive
async def test_system_stability():
    # Test system stability
    file_path = "test.mp3"
    num_concurrent = 5
    
    # Process multiple files concurrently
    start_time = time.time()
    results = await asyncio.gather(
        *[process_file(file_path) for _ in range(num_concurrent)]
    )
    end_time = time.time()
    
    # Verify all files processed successfully
    assert all(result["status"] == "processed" for result in results)
    
    # Verify processing time
    avg_time = (end_time - start_time) / num_concurrent
    assert avg_time < 300  # 5 minutes per file
    
    # Verify error rate
    error_count = sum(1 for result in results if result["status"] == "error")
    error_rate = error_count / num_concurrent
    assert error_rate < 0.05  # Less than 5% error rate

@pytest.mark.asyncio
async def test_processing_time_benchmarks():
    # Test processing times for different file sizes
    file_sizes = [10, 50, 100, 200, 500]  # MB
    results = {}
    
    for size in file_sizes:
        file_path = f"test_{size}mb.mp3"
        start_time = time.time()
        
        # Process file
        processed_file = await process_file(file_path)
        process_time = time.time() - start_time
        
        results[size] = process_time
        
        # Verify processing time is within acceptable range
        # Assuming 1MB takes 1 second to process
        assert process_time < size * 1.5  # 50% margin 