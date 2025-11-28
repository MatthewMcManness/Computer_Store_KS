@echo off
REM Start both the API server and web server for testing

echo.
echo ========================================
echo   Computer Store Gallery Manager
echo   Starting All Servers
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting API Server on port 3001...
start "Gallery API" cmd /k "cd api && npm start"

timeout /t 2 /nobreak >nul

echo Starting Web Server on port 8000...
start "Web Server" cmd /k "node test-server.js"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Both servers started!
echo ========================================
echo.
echo API Server:     http://localhost:3001
echo Web Server:     http://localhost:8000
echo.
echo Access the Gallery Manager:
echo   1. Go to: http://localhost:8000/admin-login.html
echo   2. Enter password: 52389!CS
echo   3. Manage your gallery!
echo.
echo Press any key to open in browser...
pause >nul

start http://localhost:8000/admin-login.html

echo.
echo To stop servers, close their terminal windows
echo.
