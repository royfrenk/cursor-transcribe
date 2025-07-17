import pytest
import asyncio
import time
import psutil
import os
from pathlib import Path
from src.lib.utils.fileHandling import process_file
from src.lib.utils.transcription import transcribe_audio
from src.lib.utils.diarization import identify_speakers
from src.lib.utils.summarization import generate_summary

@pytest.mark.performance
async def test_large_file_processing():
    # Test processing of 500MB file
    file_path = Path("large.mp3")
    start_time = time.time()
    
    # Process file
    processed_file = await process_file(file_path)
    process_time = time.time() - start_time
    
    # Verify processing time
    assert process_time < 300  # Should complete within 5 minutes
    
    # Verify memory usage
    process = psutil.Process(os.getpid())
    memory_usage = process.memory_info().rss / 1024 / 1024  # MB
    assert memory_usage < 2048  # Should use less than 2GB

@pytest.mark.performance
async def test_transcription_accuracy():
    # Test transcription accuracy
    file_path = Path("test.mp3")
    
    # Get transcription
    transcription = await transcribe_audio(file_path)
    
    # Calculate accuracy
    accuracy = calculate_accuracy(
        transcription["text"],
        transcription["reference_text"]
    )
    
    # Verify accuracy
    assert accuracy > 0.95  # Should be at least 95% accurate

@pytest.mark.performance
async def test_processing_time_benchmarks():
    # Test processing time for different file sizes
    file_sizes = [10, 50, 100, 200, 500]  # MB
    results = {}
    
    for size in file_sizes:
        file_path = Path(f"test_{size}mb.mp3")
        start_time = time.time()
        
        # Process file
        processed_file = await process_file(file_path)
        process_time = time.time() - start_time
        
        results[size] = process_time
        
        # Verify processing time is within acceptable range
        assert process_time < size * 0.6  # Should process 1MB in less than 0.6 seconds

@pytest.mark.performance
async def test_system_stability():
    # Test system stability under load
    num_concurrent = 5
    file_path = Path("test.mp3")
    
    # Start multiple processes
    tasks = []
    for _ in range(num_concurrent):
        tasks.append(process_file(file_path))
        tasks.append(transcribe_audio(file_path))
    
    # Wait for all processes to complete
    results = await asyncio.gather(*tasks)
    
    # Verify all processes completed successfully
    assert all(result["status"] == "completed" for result in results)
    
    # Verify system resources
    process = psutil.Process(os.getpid())
    memory_usage = process.memory_info().rss / 1024 / 1024  # MB
    cpu_percent = process.cpu_percent()
    
    assert memory_usage < 4096  # Should use less than 4GB
    assert cpu_percent < 80  # Should use less than 80% CPU

@pytest.mark.performance
async def test_concurrent_user_handling():
    # Test handling of concurrent users
    num_users = 10
    file_path = Path("test.mp3")
    
    async def simulate_user():
        # Process file
        processed_file = await process_file(file_path)
        
        # Transcribe
        transcription = await transcribe_audio(processed_file["path"])
        
        # Diarize
        diarization = await identify_speakers(transcription["segments"])
        
        # Summarize
        summary = await generate_summary(transcription["text"])
        
        return {
            "processed_file": processed_file,
            "transcription": transcription,
            "diarization": diarization,
            "summary": summary
        }
    
    # Simulate multiple users
    start_time = time.time()
    results = await asyncio.gather(*[simulate_user() for _ in range(num_users)])
    total_time = time.time() - start_time
    
    # Verify all users completed successfully
    assert all(
        result["processed_file"]["status"] == "processed" and
        result["transcription"]["status"] == "completed" and
        result["diarization"]["status"] == "completed" and
        result["summary"]["status"] == "completed"
        for result in results
    )
    
    # Verify average processing time per user
    avg_time_per_user = total_time / num_users
    assert avg_time_per_user < 60  # Should complete within 1 minute per user 