# API Documentation

## Overview
This document describes the API endpoints for the Podcast Transcription Service.

## Base URL
```
http://localhost:8000
```

## Endpoints

### GET /
Returns a welcome message.

**Response**
```json
{
    "message": "Welcome to the Podcast Transcription Service"
}
```

### POST /api/upload
Upload an audio file for transcription.

**Request**
- Content-Type: multipart/form-data
- Body: audio file (MP3, MP4, or WAV)

**Response**
```json
{
    "file_id": "string",
    "status": "uploaded"
}
```

### POST /api/transcribe
Transcribe an uploaded audio file.

**Request**
```json
{
    "file_id": "string",
    "language": "string"
}
```

**Response**
```json
{
    "transcription_id": "string",
    "status": "processing"
}
```

### GET /api/transcribe/{transcription_id}
Get transcription results.

**Response**
```json
{
    "transcription": "string",
    "speakers": [
        {
            "id": "string",
            "text": "string"
        }
    ],
    "summary": "string"
}
```

## Error Responses
All endpoints may return the following errors:

- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

Error response format:
```json
{
    "error": "string",
    "detail": "string"
}
``` 