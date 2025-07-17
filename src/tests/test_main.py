import pytest

@pytest.mark.nondestructive
def test_root_endpoint(test_client):
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Podcast Transcription Service"} 