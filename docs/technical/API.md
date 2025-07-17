# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### File Upload
```http
POST /api/upload
Content-Type: multipart/form-data

{
  "file": <audio_file>,
  "language": "en" // optional, defaults to auto-detect
}
```

**Response**
```json
{
  "id": "string",
  "filename": "string",
  "size": "number",
  "duration": "number",
  "language": "string"
}
```

### Transcription
```http
POST /api/transcribe
Content-Type: application/json

{
  "fileId": "string",
  "language": "string", // optional
  "includeSummary": "boolean" // optional
}
```

**Response**
```json
{
  "id": "string",
  "status": "processing|completed|failed",
  "transcription": {
    "text": "string",
    "segments": [
      {
        "start": "number",
        "end": "number",
        "text": "string",
        "speaker": "string"
      }
    ],
    "summary": "string" // if includeSummary is true
  }
}
```

### Export
```http
POST /api/export
Content-Type: application/json

{
  "transcriptionId": "string",
  "format": "txt|srt|vtt|pdf|csv"
}
```

**Response**
```json
{
  "url": "string", // download URL
  "expires": "string" // ISO timestamp
}
```

## Error Responses
All endpoints return errors in the following format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {} // optional
  }
}
```

### Common Error Codes
- `INVALID_FILE`: The uploaded file is invalid or unsupported
- `FILE_TOO_LARGE`: File size exceeds the maximum limit (500MB)
- `PROCESSING_ERROR`: Error during transcription processing
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `RATE_LIMITED`: Too many requests

## Rate Limits
- 100 requests per hour per IP
- 10 concurrent uploads per user
- Maximum file size: 500MB

## WebSocket Events
The API also provides real-time updates via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle different event types
  switch (data.type) {
    case 'upload_progress':
      // Handle upload progress
      break;
    case 'transcription_progress':
      // Handle transcription progress
      break;
    case 'error':
      // Handle errors
      break;
  }
};
```

## File Formats
Supported audio formats:
- MP3
- WAV
- M4A
- FLAC
- OGG

## Language Support
The API supports all languages available in Whisper, including:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hebrew (he)
- And many more...

## Best Practices
1. Always handle rate limiting by implementing exponential backoff
2. Use WebSocket for real-time progress updates
3. Implement proper error handling
4. Cache responses when appropriate
5. Use compression for large files
6. Implement retry logic for failed requests 