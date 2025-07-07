# MongoDB Setup Guide for Excel Analytics Platform

This guide will walk you through setting up MongoDB for the Excel Analytics Platform project.

## Step 1: Install MongoDB

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation
4. Install MongoDB Compass (the GUI) when prompted
5. Complete the installation

### MongoDB PowerShell (MongoDB Shell)
1. Download MongoDB Shell from [MongoDB Download Center](https://www.mongodb.com/try/download/shell)
2. Extract the downloaded file
3. Add the bin directory to your PATH environment variable

## Step 2: Start MongoDB Service

### Windows
1. MongoDB should be installed as a Windows service by default
2. Verify that the service is running:
   - Open Services (search for "Services" in Windows search)
   - Look for "MongoDB Server" and make sure it's "Running"
   - If not, right-click and select "Start"

## Step 3: Connect to MongoDB

### Using MongoDB Shell
1. Open Command Prompt or PowerShell
2. Run `mongosh` to start the MongoDB Shell
3. You should see a connection to localhost:27017
4. You're now connected to MongoDB!

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. You should see the MongoDB dashboard

## Step 4: Create the Database

### Using MongoDB Shell
1. In the MongoDB Shell, run:
   ```
   use excel_analytics
   ```
2. This will create and switch to the "excel_analytics" database

### Using MongoDB Compass
1. Click "Create Database"
2. Enter "excel_analytics" as the database name
3. Enter "users" as the collection name (we'll create more collections later)
4. Click "Create Database"

## Step 5: Initialize the Database with Sample Data

The database initialization script populates your MongoDB database with sample data for testing and development. This step is crucial for having a working application with pre-populated data.

### Prerequisites
Before running the initialization script, ensure:
1. MongoDB service is running (see Step 2)
2. The excel_analytics database exists (see Step 4)
3. You have Node.js installed and working

### Running the Initialization Script

#### Step-by-Step Process:

1. **Navigate to the server directory**:
   
   In Windows Command Prompt:
   ```
   cd E:\ExcelLens\server
   ```
   
   In Windows PowerShell:
   ```
   cd E:\ExcelLens\server
   ```
   
   If you're already in the project root, use:
   ```
   cd server
   ```

2. **Check if you're in the correct directory**:
   
   In Windows Command Prompt:
   ```
   dir scripts
   ```
   
   In Windows PowerShell:
   ```
   ls scripts
   ```
   
   You should see the `init-db.js` file listed in the output.

3. **Run the initialization script**:
   
   In both Command Prompt and PowerShell:
   ```
   node scripts/init-db.js
   ```

4. **Watch the initialization process**:
   
   You'll see colorful console output showing the progress:
   
   ```
   === Excel Analytics Platform Database Initialization ===
   Connecting to MongoDB...
   ✅ Connected to MongoDB
   Loading models...
   Creating sample users...
   ✅ Created user: Admin User (admin@example.com)
   ✅ Created user: Test User (user@example.com)
   ✅ Created user: John Doe (john@example.com)
   Creating sample uploads...
   ✅ Created upload: Sales Data 2023.xlsx
   ✅ Created upload: Customer Survey Results.xlsx
   ✅ Created upload: Inventory Q1 2023.xlsx
   Creating sample charts...
   ✅ Created chart: Monthly Sales Revenue
   ✅ Created chart: Customer Satisfaction by Age Group
   ✅ Created chart: Product Stock Levels
   === Database Initialization Complete ===
   ✅ Created 3 users
   ✅ Created 3 uploads
   ✅ Created 3 charts
   
   You can now log in with:
   Admin: admin@example.com / admin123
   User: user@example.com / user123
   ```

5. **Handling existing data**:
   
   If the database already contains data, you'll see this prompt:
   ```
   ⚠️ Database already contains data. Do you want to clear it and reinitialize?
   Press Ctrl+C to cancel or wait 5 seconds to continue...
   ```
   
   - To keep existing data: Press `Ctrl+C` to cancel
   - To reinitialize: Wait 5 seconds and the script will continue

#### Troubleshooting Common Issues:

1. **Connection Error**:
   
   If you see:
   ```
   ❌ Failed to connect to MongoDB. Aborting initialization.
   ```
   
   Check that:
   - MongoDB service is running (see Step 2)
   - You can connect using MongoDB Shell (`mongosh`)
   - The connection string in `server/config/config.json` is correct

2. **Module Not Found Error**:
   
   If you see:
   ```
   Error: Cannot find module 'mongoose'
   ```
   
   Run:
   ```
   cd ..
   npm install
   cd server
   ```

3. **Permission Error**:
   
   If you see access denied errors, try:
   - Running Command Prompt or PowerShell as Administrator
   - Checking MongoDB data directory permissions

4. **Port Already in Use**:
   
   If MongoDB can't start because port 27017 is in use:
   - Check for other MongoDB instances
   - Restart your computer
   - Configure MongoDB to use a different port

#### Verifying Successful Initialization:

After running the script, you should see the success message:
```
=== Database Initialization Complete ===
```

To verify the data was created:

1. Run the MongoDB Shell:
   ```
   mongosh
   ```

2. Switch to the excel_analytics database:
   ```
   use excel_analytics
   ```

3. Check the users collection:
   ```
   db.users.find().pretty()
   ```
   
   You should see 3 user documents with names, emails, and hashed passwords.

3. What the script does:
   - Connects to your local MongoDB instance
   - Creates three collections if they don't exist:
     - `users`: Stores user accounts and authentication data
     - `uploads`: Tracks uploaded Excel files and their metadata
     - `charts`: Stores chart configurations and relationships to uploads
   - Adds sample data to each collection:
     - 3 user accounts (admin and regular users)
     - 3 sample file uploads with metadata
     - 3 sample charts with different visualization types
   - Sets up relationships between these entities (users own uploads, uploads are linked to charts)

4. Expected output:
   You should see colorful console output showing:
   - Connection to MongoDB
   - Creation of sample users, uploads, and charts
   - Success messages for each created item
   - Summary of created data at the end
   - Login credentials you can use to test the application

### Verification
After running the script, you can verify the data was created properly:

1. Using MongoDB Shell:
   ```
   use excel_analytics
   db.users.find().pretty()
   db.uploads.find().pretty()
   db.charts.find().pretty()
   ```

2. Using MongoDB Compass:
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Click on the "excel_analytics" database
   - Click on each collection to view the documents

### Troubleshooting

#### Script Fails to Connect
If the script cannot connect to MongoDB:
- Verify MongoDB service is running (check Windows Services)
- Try connecting manually with MongoDB Shell (`mongosh`)
- Check if the connection string in `server/config/config.json` is correct

#### Permission Issues
If you see permission errors:
- Ensure you have write permissions to the MongoDB data directory
- Try running the command prompt or PowerShell as Administrator

#### Data Already Exists
If the database already contains data:
- The script will detect this and ask for confirmation before clearing existing data
- You'll have 5 seconds to cancel (Ctrl+C) if you want to keep existing data
- Otherwise, it will proceed to clear and reinitialize the database

#### Module Not Found Errors
If you see errors about missing modules:
- Make sure you've installed all dependencies:
  ```
  npm install
  ```
- If specific modules are missing, install them:
  ```
  npm install mongoose bcryptjs
  ```

### Custom Initialization
If you want to customize the sample data:
1. Open `server/scripts/init-db.js`
2. Modify the sample data arrays:
   - `sampleUsers`
   - `sampleUploads`
   - `sampleCharts`
3. Save the file and run the script again

### Next Steps
After initializing the database:
1. Return to the project root directory: `cd ..`
2. Start the application: `npm run dev`
3. Log in with one of the created accounts:
   - Admin: admin@example.com / admin123
   - User: user@example.com / user123

## Step 6: Verify the Database Setup

### Using MongoDB Shell
1. In the MongoDB Shell, run:
   ```
   use excel_analytics
   db.users.find()
   ```
2. You should see the sample users that were created

3. Check other collections:
   ```
   db.uploads.find()
   db.charts.find()
   ```

### Using MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Click on the "excel_analytics" database
3. You should see collections for "users", "uploads", and "charts"
4. Click on each collection to view the documents

## Step 7: Configure the Application

The application is already configured to connect to MongoDB at `mongodb://localhost:27017/excel_analytics`.

If you need to change this connection string:
1. Open `server/config/config.json`
2. Update the `database.uri` value with your MongoDB connection string

## Step 8: Start the Application

1. Navigate to the project root directory
2. Run the application:
   ```
   npm run dev
   ```
3. The server will connect to MongoDB automatically
4. If the connection is successful, you'll see a message: "✅ Connected to MongoDB"

## Troubleshooting

### Connection Issues
- Make sure MongoDB service is running
- Check if the MongoDB port (27017) is accessible
- Verify that the connection string is correct

### Authentication Issues
- If you've set up MongoDB with authentication, update the connection string:
  ```
  mongodb://username:password@localhost:27017/excel_analytics
  ```

### Database Initialization Errors
- Check MongoDB logs for errors
- Make sure MongoDB has write permissions to the data directory
- Verify that all required Node.js modules are installed

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Node.js Driver Documentation](https://mongodb.github.io/node-mongodb-native/)
- [Mongoose Documentation](https://mongoosejs.com/docs/) 