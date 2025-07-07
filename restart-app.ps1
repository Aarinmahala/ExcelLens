# Excel Analytics Platform Restarter

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Excel Analytics Platform Restarter" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing Node.js processes
Write-Host "Stopping any running server or client processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name "node" -Force
    Write-Host "Successfully stopped existing Node.js processes." -ForegroundColor Green
} else {
    Write-Host "No Node.js processes were running." -ForegroundColor Gray
}

# Wait a moment to ensure ports are freed
Write-Host "Waiting for ports to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Start server in a new window
Write-Host "Starting server on port 5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev"

# Wait for server to initialize
Write-Host "Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start client in a new window
Write-Host "Starting client on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; `$env:PORT=3001; npm start"

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "Server: http://localhost:5001" -ForegroundColor Green
Write-Host "Client: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "- User: user@example.com / password123" -ForegroundColor White
Write-Host "- Admin: admin@example.com / password123" -ForegroundColor White
Write-Host "===================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit this window (applications will continue running)..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 