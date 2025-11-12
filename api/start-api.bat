@echo off
REM Gallery Manager API Startup Script
REM This script starts the Gallery Manager API server

echo.
echo ========================================
echo   Computer Store Gallery Manager API
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file:
    echo 1. Copy .env.example to .env
    echo 2. Edit .env with your GitHub token and password
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo WARNING: Dependencies not installed!
    echo.
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting API server...
echo.
echo Press Ctrl+C to stop the server
echo.
echo API will be available at: http://localhost:3001
echo Health check: http://localhost:3001/api/health
echo.
echo ========================================
echo.

REM Start the server
node gallery-api.js

pause
