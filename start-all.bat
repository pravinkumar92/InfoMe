@echo off
REM InfoMe - Start All Services (Windows)

echo 🚀 Starting InfoMe Services...
echo.

REM Check if .env files exist
if not exist ".env.local" (
    echo ❌ .env.local not found! Please configure it first.
    exit /b 1
)

if not exist "scraper\.env" (
    echo ❌ scraper\.env not found! Please configure it first.
    exit /b 1
)

REM Start Frontend
echo 📱 Starting Next.js Frontend...
start "InfoMe Frontend" cmd /k "npm run dev"

REM Wait a bit
timeout /t 3 /nobreak > nul

REM Start Backend API
echo 🐍 Starting Python Backend API...
start "InfoMe Backend" cmd /k "cd scraper && python api_server.py"

echo.
echo ✅ All services started!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🐍 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Close the terminal windows to stop services
echo.

pause
