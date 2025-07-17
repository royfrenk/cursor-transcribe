# Podcast Transcription and Summarization Service

A web-based service that transcribes audio files (particularly podcasts), identifies speakers, summarizes content, and provides downloadable results.

## Features

- Audio file transcription using Whisper
- Speaker identification (diarization)
- Content summarization
- Multiple language support
- Downloadable results in PDF and CSV formats
- Support for large audio files (up to 500MB)

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```
5. Run the development server:
   ```bash
   uvicorn src.app.main:app --reload
   ```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   ├── transcribe/
│   │   └── summarize/
│   └── components/
├── lib/
│   └── utils/
└── tests/
```

## Testing

Run tests using pytest:
```bash
pytest
```

## License

MIT License
