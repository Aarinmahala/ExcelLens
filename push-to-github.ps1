# PowerShell script to push code to GitHub
# Usage: .\push-to-github.ps1 <github-username> <repository-name>

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "GitHub Repository Push Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Please install Git and try again." -ForegroundColor Red
    exit 1
}

# Check if repository is already initialized
if (!(Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize Git repository." -ForegroundColor Red
        exit 1
    }
}

# Add remote origin if not already added
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin "https://github.com/$Username/$RepoName.git"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to add remote origin." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Setting remote origin URL..." -ForegroundColor Yellow
    git remote set-url origin "https://github.com/$Username/$RepoName.git"
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to add files." -ForegroundColor Red
    exit 1
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Initial commit: Excel Analytics Platform"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to commit changes." -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push to GitHub. You might need to authenticate." -ForegroundColor Red
    Write-Host "Try running: git push -u origin master" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Code successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "Repository URL: https://github.com/$Username/$RepoName" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green 