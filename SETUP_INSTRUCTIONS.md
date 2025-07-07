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
4. Provide login credentials for testing

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
   - **User Account:**
     - Email: user@example.com
     - Password: password123
   - **Admin Account:**
     - Email: admin@example.com
     - Password: password123

## Option 2: Running with MongoDB

For full functionality, you can set up MongoDB:

1. Run the MongoDB installation script:
   ```
   powershell -ExecutionPolicy Bypass -File install-mongodb.ps1
   ```
2. Initialize MongoDB with sample data:
   ```
   mongosh < init-mongodb.js
   ```
3. Start the application:
   ```
   .\restart-app.bat
   ```

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:

1. For server port conflict (5001):
   - Edit `server/server.js` and change the PORT variable
   - Or kill the process using the port: `taskkill /F /PID <process_id>`

2. For client port conflict (3001):
   - Start the client with a different port:
     ```
     cd client
     set PORT=3002
     npm start
     ```

### MongoDB Connection Issues

If MongoDB fails to connect:

1. Check if MongoDB service is running:
   ```
   sc query MongoDB
   ```
2. Start MongoDB service if it's not running:
   ```
   net start MongoDB
   ```
3. Verify MongoDB is listening on port 27017:
   ```
   netstat -ano | findstr 27017
   ```

## GitHub Integration

### Pushing to GitHub

To push your code to GitHub:

1. Create a new repository on GitHub.com
2. Use the provided script to push your code:

   **Using PowerShell:**
   ```
   .\push-to-github.ps1 <your-github-username> <repository-name>
   ```

   **Using Batch file:**
   ```
   push-to-github.bat <your-github-username> <repository-name>
   ```

3. Enter your GitHub credentials when prompted
4. Your code will be available at: https://github.com/<your-github-username>/<repository-name>

### CI/CD with GitHub Actions

This project includes a GitHub Actions workflow file (`.github/workflows/ci.yml`) that will automatically:

1. Build the project
2. Run tests
3. Check for linting errors

The workflow runs automatically when you push to the main or master branch. 