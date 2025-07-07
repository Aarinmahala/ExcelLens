# Excel Analytics Platform - Setup Instructions

This document provides step-by-step instructions to set up and run the Excel Analytics Platform.

## Prerequisites

- Windows 10 or later
- Node.js 16+ installed
- Administrator privileges (for MongoDB installation)

## Setup Options

You have two options to run the application:

1. **Mock Mode** (No MongoDB required)
2. **MongoDB Mode** (Recommended for full functionality)

## Quick Start

For the easiest setup, simply run one of these scripts:

- **restart-app.bat** - Double-click this file to restart both server and client
- **restart-app.ps1** - Right-click and "Run with PowerShell" to restart both server and client

These scripts will:
1. Stop any running Node.js processes
2. Start the server on port 5001
3. Start the client on port 3001
4. Provide login credentials

## Option 1: Running in Mock Mode

If you don't want to install MongoDB, you can run the application in mock mode:

1. Open a terminal in the project root directory
2. Run the server:
   ```
   cd server
   npm run dev
   ```
3. Open another terminal and run the client:
   ```
   cd client
   set PORT=3001
   npm start
   ```
4. Access the application at http://localhost:3001
5. Use the following credentials to log in:
   - User: `user@example.com` / `password123`
   - Admin: `admin@example.com` / `password123`

## Option 2: Running with MongoDB (Recommended)

### Step 1: Install MongoDB

1. Right-click on `install-mongodb.ps1` and select "Run with PowerShell"
2. If prompted about execution policy, type "Y" and press Enter
3. Wait for the installation to complete
4. The script will:
   - Install MongoDB
   - Configure it as a Windows service
   - Start the MongoDB service
   - Initialize the database with sample users

### Step 2: Start the Application

1. Double-click on `start-app.bat` to start both the server and client
2. The script will:
   - Check if MongoDB is running
   - Start the server on port 5001
   - Start the client on port 3001
3. Access the application at http://localhost:3001
4. Use the following credentials to log in:
   - User: `user@example.com` / `password123`
   - Admin: `admin@example.com` / `password123`

## Troubleshooting

### Login Issues

If you're having trouble logging in:
- Make sure you're using the exact credentials: `user@example.com` / `password123` or `admin@example.com` / `password123`
- Check that both server and client are running (look for terminal windows)
- Try restarting the application using the `restart-app.bat` or `restart-app.ps1` scripts

### Port Conflicts

If you see "address already in use" errors:
1. Close all terminal windows
2. Run the restart script to properly kill all Node.js processes
3. Alternatively, open Task Manager and end all node.exe processes

### MongoDB Connection Issues

If the server fails to connect to MongoDB:
1. Check that MongoDB service is running (Services app in Windows)
2. Try restarting the MongoDB service
3. If all else fails, the application will run in mock mode 