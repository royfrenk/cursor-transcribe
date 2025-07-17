# System Architecture

## Overview
The Podcast Transcription Service is built using a modern, scalable architecture that combines Next.js for the frontend and FastAPI for the backend. The system is designed to handle large audio files, process them efficiently, and provide real-time feedback to users.

## Architecture Diagram
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Next.js   │     │   FastAPI   │
│  Browser    │◄────┤   Frontend  │◄────┤   Backend   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                  │
                           │                  │
                    ┌──────▼──────┐    ┌─────▼─────┐
                    │   Redis     │    │  Storage  │
                    │  Cache      │    │   (S3)    │
                    └─────────────┘    └───────────┘
                           │                  │
                           │                  │
                    ┌──────▼──────┐    ┌─────▼─────┐
                    │  Whisper    │    │  Workers  │
                    │   Model     │    │  (Celery) │
                    └─────────────┘    └───────────┘
```

## Components

### Frontend (Next.js)
- **Pages**
  - Home (`/`)
  - Transcription (`/transcribe`)
  - Settings (`/settings`)
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)

- **Components**
  - `FileUpload`: Handles file selection and upload
  - `TranscriptionDisplay`: Shows transcription results
  - `ProcessingProgress`: Displays processing status
  - `LanguageSelector`: Language selection interface
  - `MobileMenu`: Responsive navigation menu
  - `Navigation`: Main navigation component
  - `Footer`: Site footer with links

- **Contexts**
  - `SettingsContext`: Manages user preferences
  - `ThemeContext`: Handles theme switching
  - `NotificationContext`: Manages notifications

### Backend (FastAPI)
- **API Endpoints**
  - `/api/upload`: File upload handling
  - `/api/transcribe`: Transcription processing
  - `/api/export`: Export functionality
  - `/api/ws`: WebSocket for real-time updates

- **Services**
  - `FileService`: Handles file operations
  - `TranscriptionService`: Manages transcription
  - `ExportService`: Handles export formats
  - `StorageService`: Manages file storage

- **Workers**
  - `TranscriptionWorker`: Processes audio files
  - `DiarizationWorker`: Handles speaker detection
  - `SummaryWorker`: Generates summaries

### Infrastructure
- **Storage**
  - S3-compatible storage for audio files
  - Redis for caching and real-time updates
  - PostgreSQL for user data and metadata

- **Processing**
  - Whisper model for transcription
  - Pyannote for speaker diarization
  - GPT for summarization

- **Deployment**
  - Docker containers for services
  - Kubernetes for orchestration
  - Nginx for load balancing
  - CloudFlare for CDN

## Data Flow

1. **File Upload**
   ```
   Client → Next.js → FastAPI → S3 Storage
   ```

2. **Transcription**
   ```
   FastAPI → Celery Worker → Whisper Model → Redis → Client
   ```

3. **Export**
   ```
   Client → FastAPI → Export Service → S3 → Client
   ```

## Security Measures

1. **Authentication**
   - JWT-based authentication
   - OAuth2 for social login
   - Rate limiting per IP/user

2. **Data Protection**
   - File encryption at rest
   - Secure file deletion
   - HTTPS for all communications

3. **Access Control**
   - Role-based access control
   - API key management
   - IP whitelisting

## Performance Optimization

1. **Caching**
   - Redis for API responses
   - Browser caching for static assets
   - CDN for global distribution

2. **Processing**
   - Chunked file processing
   - Parallel processing for large files
   - Background task processing

3. **Storage**
   - Tiered storage system
   - Automatic file cleanup
   - Compression for storage

## Monitoring and Logging

1. **Metrics**
   - Request latency
   - Error rates
   - Resource usage
   - Processing times

2. **Logging**
   - Application logs
   - Access logs
   - Error logs
   - Audit logs

3. **Alerts**
   - Error rate thresholds
   - Resource usage alerts
   - Security alerts
   - Performance alerts

## Deployment Process

1. **Development**
   - Local development with Docker
   - Automated testing
   - Code review process

2. **Staging**
   - Automated deployment
   - Integration testing
   - Performance testing

3. **Production**
   - Blue-green deployment
   - Canary releases
   - Rollback capability

## Backup and Recovery

1. **Backup Strategy**
   - Daily database backups
   - Weekly file system backups
   - Monthly full system backups

2. **Recovery Procedures**
   - Database restoration
   - File system recovery
   - Service restoration

## Scaling Strategy

1. **Horizontal Scaling**
   - Stateless services
   - Load balancing
   - Auto-scaling groups

2. **Vertical Scaling**
   - Resource optimization
   - Performance tuning
   - Capacity planning 