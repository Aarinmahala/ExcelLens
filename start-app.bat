@echo off
echo ===================================
echo Excel Analytics Platform Starter
echo ===================================
echo.

REM Check if MongoDB service is running
echo Checking MongoDB service status...
sc query MongoDB | findstr "RUNNING" > nul
if %errorlevel% neq 0 (
    echo MongoDB service is not running. Starting it now...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo Failed to start MongoDB service. 
        echo Please run install-mongodb.ps1 first or start MongoDB manually.
        pause
        exit /b 1
    )
    echo MongoDB service started successfully.
) else (
    echo MongoDB service is already running.
)

REM Check if port 5001 is in use
echo Checking if port 5001 is in use...
netstat -ano | findstr ":5001" > nul
if %errorlevel% equ 0 (
    echo Port 5001 is already in use. Killing the process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5001"') do (
        taskkill /F /PID %%a
        if %errorlevel% equ 0 (
            echo Process killed successfully.
        ) else (
            echo Failed to kill process. Please close the application using port 5001 manually.
        )
    )
) else (
    echo Port 5001 is available.
)

REM Check if port 3001 is in use
echo Checking if port 3001 is in use...
netstat -ano | findstr ":3001" > nul
if %errorlevel% equ 0 (
    echo Port 3001 is already in use. Killing the process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
        taskkill /F /PID %%a
        if %errorlevel% equ 0 (
            echo Process killed successfully.
        ) else (
            echo Failed to kill process. Please close the application using port 3001 manually.
        )
    )
) else (
    echo Port 3001 is available.
)

echo.
echo Starting the application...
echo.

REM Start the application
start cmd /k "cd server && npm run dev"
timeout /t 5
start cmd /k "cd client && set PORT=3001 && npm start"

echo.
echo Application started successfully!
echo Server is running on http://localhost:5001
echo Client is running on http://localhost:3001
echo.
echo Press any key to stop the application...
pause

REM Kill all node processes
echo Stopping the application...
taskkill /F /IM node.exe
echo Application stopped.
pause 