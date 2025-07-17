import pytest
from src.lib.utils.transcription import correct_transcription, TranscriptionError

@pytest.mark.asyncio
async def test_transcription_correction():
    # Test basic error correction
    original = "Hllo wrld"
    corrected = await correct_transcription(original)
    assert corrected == "Hello world"
    
    # Test multiple errors
    original = "Hllo wrld, hw r u?"
    corrected = await correct_transcription(original)
    assert corrected == "Hello world, how are you?"
    
    # Test technical terms
    original = "The CPU procesor is runing at 2.4 GHz"
    corrected = await correct_transcription(original)
    assert corrected == "The CPU processor is running at 2.4 GHz"
    
    # Test proper nouns
    original = "John smith works at microsoft"
    corrected = await correct_transcription(original)
    assert "John Smith" in corrected
    assert "Microsoft" in corrected
    
    # Test punctuation
    original = "hello world how are you"
    corrected = await correct_transcription(original)
    assert corrected == "Hello world, how are you?"
    
    # Test numbers and units
    original = "The temperature is 25 degres celsius"
    corrected = await correct_transcription(original)
    assert corrected == "The temperature is 25 degrees Celsius"
    
    # Test empty input
    with pytest.raises(TranscriptionError):
        await correct_transcription("")
    
    # Test very long input
    long_text = "This is a very long text that needs to be corrected. " * 100
    corrected = await correct_transcription(long_text)
    assert len(corrected) > 0
    assert "." in corrected  # Verify punctuation is maintained 