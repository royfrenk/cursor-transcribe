import pytest
import os
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from src.app.main import app
from playwright.sync_api import sync_playwright
import shutil
from pathlib import Path

# Mock environment variables
os.environ["OPENAI_API_KEY"] = "sk-test-key"
os.environ["WHISPER_API_KEY"] = "sk-test-key"
os.environ["STORAGE_BUCKET"] = "test-bucket"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["CACHE_URL"] = "redis://localhost:6379/0"

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def mock_openai():
    with patch("openai.OpenAI") as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_storage():
    with patch("src.lib.utils.storage.StorageClient") as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_cache():
    with patch("src.lib.utils.cache.CacheClient") as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_db():
    with patch("src.lib.utils.database.DatabaseClient") as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def test_files(tmp_path):
    # Create test files directory
    test_dir = tmp_path / "test_files"
    test_dir.mkdir()
    
    # Create test audio file
    test_file = test_dir / "test.mp3"
    test_file.write_bytes(b"dummy audio content")
    
    # Create large test file
    large_file = test_dir / "large.mp3"
    large_file.write_bytes(b"dummy audio content" * 1000)
    
    # Create invalid file
    invalid_file = test_dir / "invalid.txt"
    invalid_file.write_bytes(b"invalid content")
    
    return test_dir

@pytest.fixture
def browser_context_args():
    return {
        "viewport": {"width": 1280, "height": 720},
        "record_video_dir": "test-results/videos",
        "record_video_size": {"width": 1280, "height": 720}
    }

@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:3001"

@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def test_api_key():
    return "sk-test-key"

@pytest.fixture(scope="session")
def mock_whisper_model():
    class MockWhisperModel:
        def transcribe(self, audio_file):
            return {
                "text": "This is a test transcription.",
                "segments": [
                    {
                        "start": 0,
                        "end": 5,
                        "text": "This is"
                    },
                    {
                        "start": 5,
                        "end": 10,
                        "text": "a test"
                    }
                ]
            }
    
    return MockWhisperModel()

@pytest.fixture(scope="session")
def test_environment():
    # Set up test environment variables
    os.environ["TESTING"] = "true"
    os.environ["API_KEY"] = "test-api-key-123"
    os.environ["STORAGE_BUCKET"] = "test-bucket"
    os.environ["REDIS_URL"] = "redis://localhost:6379/0"
    os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test"
    
    yield
    
    # Cleanup environment variables
    for key in ["TESTING", "API_KEY", "STORAGE_BUCKET", "REDIS_URL", "DATABASE_URL"]:
        if key in os.environ:
            del os.environ[key]

# NOTE: Do NOT define a custom 'browser' fixture here. Use pytest-playwright's built-in browser fixture for browser automation tests. 