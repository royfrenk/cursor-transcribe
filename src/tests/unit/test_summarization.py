import pytest
from src.lib.utils.summarization import generate_summary, SummaryError

@pytest.mark.asyncio
async def test_summary_quality():
    # Test basic summarization
    text = """
    The podcast discussed three main topics. First, they talked about climate change and its impact on global temperatures.
    Second, they explored renewable energy solutions, particularly solar and wind power. Finally, they discussed policy
    changes needed to address these issues.
    """
    summary = await generate_summary(text)
    assert len(summary) < len(text)  # Summary should be shorter
    assert "climate change" in summary.lower()
    assert "renewable energy" in summary.lower()
    assert "policy" in summary.lower()
    
    # Test speaker-specific points
    text = """
    John: I believe we need to focus on reducing carbon emissions.
    Sarah: We should invest more in renewable energy infrastructure.
    John: But we also need to consider economic impacts.
    Sarah: The long-term benefits outweigh the costs.
    """
    summary = await generate_summary(text)
    assert "John" in summary
    assert "Sarah" in summary
    assert "carbon emissions" in summary.lower()
    assert "renewable energy" in summary.lower()
    
    # Test key points extraction
    text = """
    The main points discussed were:
    1. Climate change is accelerating
    2. Renewable energy is becoming more affordable
    3. Policy changes are needed
    4. Public awareness is increasing
    """
    summary = await generate_summary(text)
    assert "climate change" in summary.lower()
    assert "renewable energy" in summary.lower()
    assert "policy" in summary.lower()
    assert "public awareness" in summary.lower()
    
    # Test summary length constraints
    text = "This is a very short text."
    summary = await generate_summary(text, max_length=50)
    assert len(summary) <= 50
    
    # Test empty input
    with pytest.raises(SummaryError):
        await generate_summary("")
    
    # Test very long input
    long_text = "This is a very long text. " * 1000
    summary = await generate_summary(long_text)
    assert len(summary) < len(long_text)
    assert len(summary.split()) <= 100  # Summary should be concise
    
    # Test multilingual input
    text = """
    English: Climate change is a global issue.
    Español: El cambio climático es un problema global.
    Français: Le changement climatique est un problème mondial.
    """
    summary = await generate_summary(text)
    assert len(summary) > 0
    assert any(lang in summary for lang in ["English", "Español", "Français"])
    
    # Test technical content
    text = """
    The CPU architecture consists of:
    1. ALU (Arithmetic Logic Unit)
    2. Control Unit
    3. Registers
    4. Cache memory
    """
    summary = await generate_summary(text)
    assert "CPU" in summary
    assert "architecture" in summary.lower()
    assert any(term in summary for term in ["ALU", "Control Unit", "Registers", "Cache"]) 