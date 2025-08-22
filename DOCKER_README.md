# Docker Setup for AI Lecturer

This document explains how to use Docker to run the AI Lecturer application.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Environment variables configured (see `env.example`)

## Quick Start

### 1. Production Mode
```bash
# Start the application
./deploy.sh start          # Linux/Mac
deploy.bat start           # Windows

# View logs
./deploy.sh logs           # Linux/Mac
deploy.bat logs            # Windows

# Stop the application
./deploy.sh stop           # Linux/Mac
deploy.bat stop            # Windows
```

### 2. Development Mode
```bash
# Start development environment
./deploy.sh start-dev      # Linux/Mac
deploy.bat start-dev       # Windows

# This will start:
# - Backend on port 5001 (with hot reload)
# - Frontend on port 3000 (with hot reload)
# - MongoDB on port 27017
```

## Manual Docker Commands

### Build Images
```bash
docker compose build
```

### Start Services
```bash
# Production
docker compose up -d

# Development (includes frontend dev server)
docker compose --profile dev up -d
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f mongodb
```

### Stop Services
```bash
docker compose down
```

### Clean Up Everything
```bash
docker compose down -v --rmi all
docker system prune -f
```

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │     MongoDB     │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   (Port 27017)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Copy example file
cp env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

Required variables:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name for file storage
- `OPENAI_API_KEY` - Your OpenAI API key

## Ports

- **5000**: Backend API (production)
- **5001**: Backend API (development)
- **3000**: Frontend (development only)
- **27017**: MongoDB
- **80/443**: Nginx (production profile)

## Volumes

- `mongodb_data`: MongoDB data persistence
- `./uploads`: File uploads directory
- `./logs`: Application logs directory

## Development Workflow

1. **Start development environment:**
   ```bash
   ./deploy.sh start-dev
   ```

2. **Make code changes** - they will automatically reload

3. **View logs:**
   ```bash
   ./deploy.sh logs
   ```

4. **Stop when done:**
   ```bash
   ./deploy.sh stop
   ```

## Production Deployment

1. **Build production images:**
   ```bash
   ./deploy.sh build
   ```

2. **Start production services:**
   ```bash
   ./deploy.sh start
   ```

3. **Optional: Enable Nginx reverse proxy:**
   ```bash
   docker compose --profile production up -d
   ```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :5000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **MongoDB connection issues:**
   ```bash
   # Check MongoDB logs
   docker compose logs mongodb
   
   # Restart MongoDB
   docker compose restart mongodb
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER uploads logs
   ```

4. **Docker daemon not running:**
   - Start Docker Desktop
   - Wait for Docker to be ready
   - Try again

### Reset Everything

```bash
# Stop and remove everything
./deploy.sh clean

# Rebuild from scratch
./deploy.sh build
./deploy.sh start
```

## Performance Tips

1. **Use `.dockerignore`** - Already configured to exclude unnecessary files
2. **Multi-stage builds** - Production image is optimized
3. **Volume mounts** - Development uses bind mounts for hot reloading
4. **Health checks** - Services include health monitoring

## Security Notes

- Change default MongoDB passwords in production
- Use strong JWT secrets
- Configure proper AWS IAM roles
- Enable HTTPS in production (see nginx.conf)
- Review and adjust rate limiting as needed

## Next Steps

After starting the application:

1. **Access the frontend:** http://localhost:3000 (dev) or http://localhost (prod)
2. **Register a new user account**
3. **Upload a presentation file** (PPTX or PDF)
4. **Wait for AI processing** to complete
5. **Play your generated lecture!**

For more information, see the main [README.md](README.md).
