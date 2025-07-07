# MongoDB Installation Script for Windows
# This script downloads and installs MongoDB Community Edition on Windows

Write-Host "MongoDB Installation Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Create directories for MongoDB
$mongoDbPath = "C:\MongoDB"
$mongoDbDataPath = "$mongoDbPath\data\db"
$mongoDbLogPath = "$mongoDbPath\log"

if (-not (Test-Path $mongoDbPath)) {
    Write-Host "Creating MongoDB directories..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $mongoDbPath -Force | Out-Null
    New-Item -ItemType Directory -Path $mongoDbDataPath -Force | Out-Null
    New-Item -ItemType Directory -Path $mongoDbLogPath -Force | Out-Null
    Write-Host "MongoDB directories created." -ForegroundColor Green
} else {
    Write-Host "MongoDB directories already exist." -ForegroundColor Yellow
}

# Download MongoDB installer
$downloadUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.6-signed.msi"
$installerPath = "$env:TEMP\mongodb-installer.msi"

Write-Host "Downloading MongoDB installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
    Write-Host "MongoDB installer downloaded successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to download MongoDB installer: $_" -ForegroundColor Red
    exit 1
}

# Install MongoDB
Write-Host "Installing MongoDB..." -ForegroundColor Yellow
try {
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet INSTALLLOCATION=`"$mongoDbPath`" ADDLOCAL=ALL" -Wait
    Write-Host "MongoDB installed successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to install MongoDB: $_" -ForegroundColor Red
    exit 1
}

# Create MongoDB configuration file
$configContent = @"
# MongoDB Configuration File

# Where and how to store data
storage:
  dbPath: $($mongoDbDataPath.Replace('\', '/'))
  journal:
    enabled: true

# Where to write logging data
systemLog:
  destination: file
  logAppend: true
  path: $($mongoDbLogPath.Replace('\', '/'))/mongod.log

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1
"@

$configPath = "$mongoDbPath\mongod.cfg"
Write-Host "Creating MongoDB configuration file..." -ForegroundColor Yellow
try {
    Set-Content -Path $configPath -Value $configContent
    Write-Host "MongoDB configuration file created." -ForegroundColor Green
} catch {
    Write-Host "Failed to create MongoDB configuration file: $_" -ForegroundColor Red
    exit 1
}

# Install MongoDB as a service
Write-Host "Installing MongoDB as a service..." -ForegroundColor Yellow
try {
    & "$mongoDbPath\bin\mongod.exe" --config "$configPath" --install
    Write-Host "MongoDB service installed." -ForegroundColor Green
} catch {
    Write-Host "Failed to install MongoDB service: $_" -ForegroundColor Red
    exit 1
}

# Start MongoDB service
Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service MongoDB
    Write-Host "MongoDB service started." -ForegroundColor Green
} catch {
    Write-Host "Failed to start MongoDB service: $_" -ForegroundColor Red
    exit 1
}

# Download MongoDB Shell (mongosh)
$mongoshDownloadUrl = "https://downloads.mongodb.com/compass/mongosh-1.10.1-win32-x64.zip"
$mongoshZipPath = "$env:TEMP\mongosh.zip"
$mongoshExtractPath = "$env:TEMP\mongosh"

Write-Host "Downloading MongoDB Shell (mongosh)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $mongoshDownloadUrl -OutFile $mongoshZipPath
    Write-Host "MongoDB Shell downloaded successfully." -ForegroundColor Green
    
    # Extract MongoDB Shell
    Write-Host "Extracting MongoDB Shell..." -ForegroundColor Yellow
    Expand-Archive -Path $mongoshZipPath -DestinationPath $mongoshExtractPath -Force
    
    # Copy mongosh to MongoDB bin directory
    $mongoshFiles = Get-ChildItem -Path $mongoshExtractPath -Recurse -Include "mongosh.exe", "*.dll"
    foreach ($file in $mongoshFiles) {
        Copy-Item -Path $file.FullName -Destination "$mongoDbPath\bin\" -Force
    }
    Write-Host "MongoDB Shell installed." -ForegroundColor Green
} catch {
    Write-Host "Failed to download or install MongoDB Shell: $_" -ForegroundColor Red
    Write-Host "You may need to download and install MongoDB Shell manually." -ForegroundColor Yellow
}

# Create a MongoDB initialization script
$initScriptPath = "$PSScriptRoot\init-mongodb.js"
$initScriptContent = @"
// MongoDB initialization script
print('Creating excel_analytics database...');
db = db.getSiblingDB('excel_analytics');

// Create users collection
print('Creating users collection...');
db.createCollection('users');

// Add sample users
print('Adding sample users...');
db.users.insertMany([
  {
    name: 'Test User',
    email: 'user@example.com',
    password: '\$2a\$10\$rrm7C.SHPDVQqLQwLX2vxuJlKlGQ5xnq.K7RH8YUlPCpPUEH4OvMi', // password123
    role: 'user',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 5,
    chartCount: 3,
    createdAt: new Date()
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '\$2a\$10\$rrm7C.SHPDVQqLQwLX2vxuJlKlGQ5xnq.K7RH8YUlPCpPUEH4OvMi', // password123
    role: 'admin',
    isActive: true,
    lastLogin: new Date(),
    uploadCount: 10,
    chartCount: 8,
    createdAt: new Date()
  }
]);

print('MongoDB initialization completed successfully!');
"@

Write-Host "Creating MongoDB initialization script..." -ForegroundColor Yellow
try {
    Set-Content -Path $initScriptPath -Value $initScriptContent
    Write-Host "MongoDB initialization script created." -ForegroundColor Green
} catch {
    Write-Host "Failed to create MongoDB initialization script: $_" -ForegroundColor Red
    exit 1
}

# Initialize MongoDB with sample data
Write-Host "Initializing MongoDB with sample data..." -ForegroundColor Yellow
try {
    # Try to use mongosh if available
    if (Test-Path "$mongoDbPath\bin\mongosh.exe") {
        & "$mongoDbPath\bin\mongosh.exe" "mongodb://localhost:27017" --file $initScriptPath
    } else {
        # Fall back to mongo if mongosh is not available
        & "$mongoDbPath\bin\mongo.exe" --file $initScriptPath
    }
    Write-Host "MongoDB initialized with sample data." -ForegroundColor Green
} catch {
    Write-Host "Failed to initialize MongoDB with sample data: $_" -ForegroundColor Red
    Write-Host "You can manually initialize MongoDB by running: mongosh mongodb://localhost:27017 --file $initScriptPath" -ForegroundColor Yellow
}

Write-Host "MongoDB installation and setup completed!" -ForegroundColor Green
Write-Host "MongoDB is running at: mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "You can now start your application with: npm run dev" -ForegroundColor Cyan 