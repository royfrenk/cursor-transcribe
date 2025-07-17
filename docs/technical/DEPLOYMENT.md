# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for production)
- AWS account (or similar cloud provider)
- Domain name and SSL certificates
- Git repository access

## Environment Setup

### 1. Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/podcast-transcribe.git
cd podcast-transcribe

# Install dependencies
npm install
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Production Environment

```bash
# Create production environment file
cp .env.example .env.production

# Required environment variables
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET=your_bucket
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your_jwt_secret
```

## Docker Setup

### 1. Build Images

```bash
# Build frontend image
docker build -t podcast-transcribe-frontend -f frontend/Dockerfile .

# Build backend image
docker build -t podcast-transcribe-backend -f backend/Dockerfile .
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    image: podcast-transcribe-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    image: podcast-transcribe-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace podcast-transcribe
```

### 2. Deploy Secrets

```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-file=.env.production \
  --namespace podcast-transcribe
```

### 3. Deploy Services

```bash
# Apply configurations
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/db-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
```

## SSL Configuration

### 1. Obtain Certificates

```bash
# Using Let's Encrypt
certbot certonly --standalone -d your-domain.com
```

### 2. Configure Nginx

```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring Setup

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']
```

### 2. Grafana Dashboards

```bash
# Import dashboards
kubectl apply -f k8s/grafana-dashboards.yaml
```

## Backup Configuration

### 1. Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$TIMESTAMP.sql
aws s3 cp backup_$TIMESTAMP.sql s3://$BACKUP_BUCKET/db/
EOF

# Add to crontab
0 0 * * * /path/to/backup.sh
```

### 2. File System Backup

```bash
# Create backup script
cat > backup-files.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf files_$TIMESTAMP.tar.gz /path/to/files
aws s3 cp files_$TIMESTAMP.tar.gz s3://$BACKUP_BUCKET/files/
EOF

# Add to crontab
0 0 * * 0 /path/to/backup-files.sh
```

## Scaling Configuration

### 1. Horizontal Pod Autoscaling

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. Load Balancer

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: tls-secret
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 80
```

## Maintenance Procedures

### 1. Database Maintenance

```bash
# Vacuum database
kubectl exec -it $(kubectl get pod -l app=db -o jsonpath="{.items[0].metadata.name}") -- \
  psql -U $DB_USER -d $DB_NAME -c "VACUUM ANALYZE;"

# Check database size
kubectl exec -it $(kubectl get pod -l app=db -o jsonpath="{.items[0].metadata.name}") -- \
  psql -U $DB_USER -d $DB_NAME -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));"
```

### 2. Log Rotation

```bash
# Configure log rotation
cat > /etc/logrotate.d/podcast-transcribe << 'EOF'
/var/log/podcast-transcribe/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
EOF
```

### 3. Security Updates

```bash
# Update dependencies
npm audit fix
pip install --upgrade -r requirements.txt

# Rebuild and redeploy
docker-compose build
docker-compose up -d
```

## Troubleshooting

### 1. Common Issues

- **Database Connection Issues**
  ```bash
  kubectl logs -l app=backend
  kubectl describe pod -l app=db
  ```

- **Memory Issues**
  ```bash
  kubectl top pods
  kubectl describe node
  ```

- **Network Issues**
  ```bash
  kubectl get svc
  kubectl describe ingress
  ```

### 2. Recovery Procedures

- **Database Recovery**
  ```bash
  # Restore from backup
  kubectl exec -it $(kubectl get pod -l app=db -o jsonpath="{.items[0].metadata.name}") -- \
    psql -U $DB_USER -d $DB_NAME < backup.sql
  ```

- **Service Recovery**
  ```bash
  # Restart services
  kubectl rollout restart deployment frontend
  kubectl rollout restart deployment backend
  ```

## Performance Tuning

### 1. Database Tuning

```sql
-- Optimize PostgreSQL
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '3GB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET work_mem = '16MB';
```

### 2. Application Tuning

```bash
# Optimize Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimize Python
export PYTHONUNBUFFERED=1
export PYTHONOPTIMIZE=2
```

## Security Measures

### 1. Network Security

```bash
# Configure firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Access Control

```bash
# Set up IP whitelist
kubectl create configmap ip-whitelist --from-file=whitelist.txt

# Configure rate limiting
kubectl create configmap rate-limit --from-file=rate-limit.conf
``` 