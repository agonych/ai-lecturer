@echo off
setlocal enabledelayedexpansion

REM AI Lecturer Deployment Script for Windows
REM Usage: deploy.bat [command]

if "%1"=="" goto help

if "%1"=="start" goto start
if "%1"=="start-dev" goto start_dev
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help

echo [ERROR] Unknown command: %1
echo.
goto help

:start
echo [INFO] Starting AI Lecturer application...
call :check_docker
call :check_env
call :create_dirs
docker compose up -d
if %errorlevel% equ 0 (
    echo [SUCCESS] Application started successfully!
    echo [INFO] Backend: http://localhost:5000
    echo [INFO] MongoDB: localhost:27017
    echo [INFO] View logs: deploy.bat logs
) else (
    echo [ERROR] Failed to start application
)
goto end

:start_dev
echo [INFO] Starting AI Lecturer development environment...
call :check_docker
call :check_env
call :create_dirs
docker compose --profile dev up -d
if %errorlevel% equ 0 (
    echo [SUCCESS] Development environment started successfully!
    echo [INFO] Backend (dev): http://localhost:5001
    echo [INFO] Frontend (dev): http://localhost:3000
    echo [INFO] MongoDB: localhost:27017
    echo [INFO] View logs: deploy.bat logs
) else (
    echo [ERROR] Failed to start development environment
)
goto end

:stop
echo [INFO] Stopping AI Lecturer application...
docker compose down
if %errorlevel% equ 0 (
    echo [SUCCESS] Application stopped successfully!
) else (
    echo [ERROR] Failed to stop application
)
goto end

:restart
echo [INFO] Restarting AI Lecturer application...
call :stop
timeout /t 2 /nobreak >nul
call :start
goto end

:logs
echo [INFO] Showing application logs...
docker compose logs -f
goto end

:status
echo [INFO] AI Lecturer application status:
docker compose ps
goto end

:build
echo [INFO] Building Docker images...
call :check_docker
docker compose build --no-cache
if %errorlevel% equ 0 (
    echo [SUCCESS] Images built successfully!
) else (
    echo [ERROR] Failed to build images
)
goto end

:clean
echo [WARNING] This will remove all containers, volumes, and images. Are you sure? (Y/N)
set /p response=
if /i "!response!"=="Y" (
    echo [INFO] Cleaning up Docker resources...
    docker compose down -v --rmi all
    docker system prune -f
    echo [SUCCESS] Cleanup completed!
) else (
    echo [INFO] Cleanup cancelled.
)
goto end

:help
echo AI Lecturer Deployment Script for Windows
echo.
echo Usage: deploy.bat [command]
echo.
echo Commands:
echo   start     Start the application in production mode
echo   start-dev Start the application in development mode
echo   stop      Stop the application
echo   restart   Restart the application
echo   logs      Show application logs
echo   status    Show application status
echo   build     Build Docker images
echo   clean     Clean up Docker resources (containers, volumes, images)
echo   help      Show this help message
echo.
echo Examples:
echo   deploy.bat start     # Start production environment
echo   deploy.bat start-dev # Start development environment
echo   deploy.bat logs      # View logs
goto end

:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)
goto :eof

:check_env
if not exist .env (
    echo [WARNING] .env file not found. Creating from env.example...
    if exist env.example (
        copy env.example .env >nul
        echo [WARNING] Please edit .env file with your actual configuration values.
        echo [WARNING] Required variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, OPENAI_API_KEY
    ) else (
        echo [ERROR] env.example file not found. Please create .env file manually.
        exit /b 1
    )
)
goto :eof

:create_dirs
if not exist uploads mkdir uploads
if not exist logs mkdir logs
goto :eof

:end
endlocal
