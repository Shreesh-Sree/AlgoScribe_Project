@echo off
echo 🚀 Starting AlgoScribe deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Build Next.js frontend for static export
echo 📦 Building Next.js frontend...
cd frontend
call npm install
call npm run build
cd ..

REM Deploy to Firebase
echo 🔥 Deploying to Firebase...
firebase deploy

echo ✅ Deployment complete!
echo 🌐 Your app should be available at your Firebase hosting URL