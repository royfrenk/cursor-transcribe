# Security Measures

## 1. Authentication and Authorization

### 1.1 JWT Implementation
```typescript
// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '1h',
  algorithm: 'HS256'
};

// Token generation
const token = jwt.sign(
  { userId: user.id, role: user.role },
  jwtConfig.secret,
  { expiresIn: jwtConfig.expiresIn }
);

// Token verification
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

### 1.2 Role-Based Access Control
```typescript
// Role definitions
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// Permission checks
const checkPermission = (user: User, resource: string, action: string) => {
  const permissions = {
    [UserRole.ADMIN]: ['*'],
    [UserRole.USER]: ['read', 'write'],
    [UserRole.GUEST]: ['read']
  };
  
  return permissions[user.role].includes(action);
};
```

## 2. Data Protection

### 2.1 File Encryption
```typescript
// File encryption
const encryptFile = async (file: Buffer) => {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    file
  );
  
  return { encrypted, key, iv };
};

// File decryption
const decryptFile = async (encrypted: Buffer, key: CryptoKey, iv: Uint8Array) => {
  return await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
};
```

### 2.2 Secure File Deletion
```typescript
// Secure file deletion
const secureDelete = async (filePath: string) => {
  // Overwrite file with random data
  const fileSize = await fs.promises.stat(filePath).then(stat => stat.size);
  const randomData = crypto.randomBytes(fileSize);
  await fs.promises.writeFile(filePath, randomData);
  
  // Delete file
  await fs.promises.unlink(filePath);
};
```

## 3. Network Security

### 3.1 HTTPS Configuration
```nginx
# Nginx HTTPS configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

### 3.2 Rate Limiting
```typescript
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', limiter);
```

## 4. Access Control

### 4.1 IP Whitelisting
```typescript
// IP whitelist middleware
const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
  const whitelist = process.env.IP_WHITELIST.split(',');
  const clientIP = req.ip;
  
  if (!whitelist.includes(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

app.use('/api/admin/', ipWhitelist);
```

### 4.2 API Key Management
```typescript
// API key validation
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

app.use('/api/', validateApiKey);
```

## 5. Security Headers

### 5.1 HTTP Security Headers
```typescript
// Security headers middleware
const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
  
  next();
};

app.use(securityHeaders);
```

### 5.2 CORS Configuration
```typescript
// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
```

## 6. Data Validation

### 6.1 Input Validation
```typescript
// Input validation middleware
const validateInput = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    next();
  };
};

// Usage example
const fileUploadSchema = Joi.object({
  file: Joi.binary().max(500 * 1024 * 1024).required(),
  language: Joi.string().valid('en', 'es', 'fr').required()
});

app.post('/api/upload', validateInput(fileUploadSchema), uploadHandler);
```

### 6.2 Output Sanitization
```typescript
// Output sanitization
const sanitizeOutput = (data: any) => {
  if (typeof data === 'string') {
    return sanitizeHtml(data, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        'a': ['href']
      }
    });
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeOutput(value)])
    );
  }
  
  return data;
};
```

## 7. Logging and Monitoring

### 7.1 Security Logging
```typescript
// Security logging middleware
const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id
  };
  
  logger.info('Security event', logData);
  next();
};

app.use(securityLogger);
```

### 7.2 Error Monitoring
```typescript
// Error monitoring
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  };
  
  logger.error('Application error', errorData);
  
  // Send error to monitoring service
  monitoringService.captureException(err);
  
  res.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);
```

## 8. Backup and Recovery

### 8.1 Secure Backup
```typescript
// Secure backup function
const secureBackup = async () => {
  const timestamp = new Date().toISOString();
  const backupPath = `/backups/${timestamp}`;
  
  // Create encrypted backup
  const backup = await createBackup();
  const encrypted = await encryptBackup(backup);
  
  // Upload to secure storage
  await uploadToSecureStorage(encrypted, backupPath);
  
  // Verify backup
  const verification = await verifyBackup(backupPath);
  
  return verification;
};
```

### 8.2 Recovery Procedures
```typescript
// Recovery function
const recoverFromBackup = async (backupId: string) => {
  // Download backup
  const encrypted = await downloadFromSecureStorage(backupId);
  
  // Decrypt backup
  const backup = await decryptBackup(encrypted);
  
  // Verify backup integrity
  if (!await verifyBackupIntegrity(backup)) {
    throw new Error('Backup integrity check failed');
  }
  
  // Restore from backup
  await restoreFromBackup(backup);
  
  return true;
};
```

## 9. Compliance

### 9.1 GDPR Compliance
```typescript
// GDPR compliance functions
const handleDataRequest = async (userId: string) => {
  // Get user data
  const userData = await getUserData(userId);
  
  // Anonymize sensitive data
  const anonymizedData = anonymizeData(userData);
  
  return anonymizedData;
};

const handleDataDeletion = async (userId: string) => {
  // Delete user data
  await deleteUserData(userId);
  
  // Delete associated files
  await deleteUserFiles(userId);
  
  // Log deletion
  await logDataDeletion(userId);
};
```

### 9.2 Data Retention
```typescript
// Data retention policy
const retentionPolicy = {
  userData: '2 years',
  transcriptionData: '1 year',
  fileData: '6 months',
  logs: '3 months'
};

const cleanupExpiredData = async () => {
  const now = new Date();
  
  // Clean up expired user data
  await cleanupUserData(now, retentionPolicy.userData);
  
  // Clean up expired transcription data
  await cleanupTranscriptionData(now, retentionPolicy.transcriptionData);
  
  // Clean up expired file data
  await cleanupFileData(now, retentionPolicy.fileData);
  
  // Clean up expired logs
  await cleanupLogs(now, retentionPolicy.logs);
};
``` 