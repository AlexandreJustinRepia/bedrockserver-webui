@echo off
title Bedrock Server Web UI
echo Starting Bedrock Server Web UI...

cd /d "%~dp0"

:: Start backend in a new window
start "Bedrock Server API" cmd /c "npm run server"

:: Wait for backend to be ready
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Bedrock Server Web UI" cmd /c "npm run dev"

:: Wait for frontend to start
timeout /t 4 /nobreak >nul

:: Open browser
start http://localhost:5173

echo.
echo Bedrock Server Web UI is running!
echo - API: http://localhost:3001
echo - Web UI: http://localhost:5173
echo.
echo Close this window or press Ctrl+C to stop.
pause
