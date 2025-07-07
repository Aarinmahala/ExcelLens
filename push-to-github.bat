@echo off
echo ====================================
echo GitHub Repository Push Script
echo ====================================
echo.

if "%~1"=="" goto :usage
if "%~2"=="" goto :usage

set USERNAME=%~1
set REPONAME=%~2

REM Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed. Please install Git and try again.
    exit /b 1
)

REM Check if repository is already initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    if %errorlevel% neq 0 (
        echo Failed to initialize Git repository.
        exit /b 1
    )
)

REM Add remote origin if not already added
git remote | findstr /i "origin" >nul
if %errorlevel% neq 0 (
    echo Adding remote origin...
    git remote add origin "https://github.com/%USERNAME%/%REPONAME%.git"
    if %errorlevel% neq 0 (
        echo Failed to add remote origin.
        exit /b 1
    )
) else (
    echo Setting remote origin URL...
    git remote set-url origin "https://github.com/%USERNAME%/%REPONAME%.git"
)

REM Add all files
echo Adding files to Git...
git add .
if %errorlevel% neq 0 (
    echo Failed to add files.
    exit /b 1
)

REM Commit changes
echo Committing changes...
git commit -m "Initial commit: Excel Analytics Platform"
if %errorlevel% neq 0 (
    echo Failed to commit changes.
    exit /b 1
)

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin master
if %errorlevel% neq 0 (
    echo Failed to push to GitHub. You might need to authenticate.
    echo Try running: git push -u origin master
    exit /b 1
)

echo.
echo ====================================
echo Code successfully pushed to GitHub!
echo Repository URL: https://github.com/%USERNAME%/%REPONAME%
echo ====================================
goto :eof

:usage
echo Usage: %~nx0 ^<github-username^> ^<repository-name^>
echo Example: %~nx0 johndoe excel-analytics
exit /b 1 