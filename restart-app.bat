@echo off
echo ===================================
echo Excel Analytics Platform Restarter
echo ===================================
echo.

REM Kill existing Node.js processes
echo Stopping any running server or client processes...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo Successfully stopped existing Node.js processes.
) else (
    echo No Node.js processes were running.
)

REM Wait a moment to ensure ports are freed
timeout /t 2 /nobreak > nul

REM Start server
echo Starting server on port 5001...
start cmd /k "cd server && npm run dev"

REM Wait for server to initialize
echo Waiting for server to initialize...
timeout /t 5 /nobreak > nul

REM Start client
echo Starting client on port 3001...
start cmd /k "cd client && set PORT=3001 && npm start"

echo.
echo ===================================
echo Server: http://localhost:5001
echo Client: http://localhost:3001
echo.
echo Login credentials:
echo - User: user@example.com / password123
echo - Admin: admin@example.com / password123
echo ===================================

echo.
echo Press any key to exit this window (applications will continue running)...
pause > nul 