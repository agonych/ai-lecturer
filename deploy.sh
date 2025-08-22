#!/bin/bash

# AI Lecturer Deployment Script
# Usage: ./deploy.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to check environment file
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from env.example..."
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Please edit .env file with your actual configuration values."
            print_warning "Required variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, OPENAI_API_KEY"
        else
            print_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Function to start the application
start() {
    print_status "Starting AI Lecturer application..."
    check_docker
    check_docker_compose
    check_env
    
    # Create necessary directories
    mkdir -p uploads logs
    
    # Start services
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    print_success "Application started successfully!"
    print_status "Backend: http://localhost:5000"
    print_status "Frontend: http://localhost:3000 (if using dev profile)"
    print_status "MongoDB: localhost:27017"
    print_status "View logs: ./deploy.sh logs"
}

# Function to start development environment
start_dev() {
    print_status "Starting AI Lecturer development environment..."
    check_docker
    check_docker_compose
    check_env
    
    # Create necessary directories
    mkdir -p uploads logs
    
    # Start development services
    if command -v docker-compose &> /dev/null; then
        docker-compose --profile dev up -d
    else
        docker compose --profile dev up -d
    fi
    
    print_success "Development environment started successfully!"
    print_status "Backend (dev): http://localhost:5001"
    print_status "Frontend (dev): http://localhost:3000"
    print_status "MongoDB: localhost:27017"
    print_status "View logs: ./deploy.sh logs"
}

# Function to stop the application
stop() {
    print_status "Stopping AI Lecturer application..."
    if command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    print_success "Application stopped successfully!"
}

# Function to restart the application
restart() {
    print_status "Restarting AI Lecturer application..."
    stop
    sleep 2
    start
}

# Function to show logs
logs() {
    if command -v docker-compose &> /dev/null; then
        docker-compose logs -f
    else
        docker compose logs -f
    fi
}

# Function to show status
status() {
    print_status "AI Lecturer application status:"
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
}

# Function to build images
build() {
    print_status "Building Docker images..."
    check_docker
    check_docker_compose
    
    if command -v docker-compose &> /dev/null; then
        docker-compose build --no-cache
    else
        docker compose build --no-cache
    fi
    
    print_success "Images built successfully!"
}

# Function to clean up
clean() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        if command -v docker-compose &> /dev/null; then
            docker-compose down -v --rmi all
        else
            docker compose down -v --rmi all
        fi
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show help
help() {
    echo "AI Lecturer Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the application in production mode"
    echo "  start-dev Start the application in development mode"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show application logs"
    echo "  status    Show application status"
    echo "  build     Build Docker images"
    echo "  clean     Clean up Docker resources (containers, volumes, images)"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh start     # Start production environment"
    echo "  ./deploy.sh start-dev # Start development environment"
    echo "  ./deploy.sh logs      # View logs"
}

# Main script logic
case "${1:-help}" in
    start)
        start
        ;;
    start-dev)
        start_dev
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    build)
        build
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac
