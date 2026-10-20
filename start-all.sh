#!/bin/bash

# InfoMe - Start All Services

echo "🚀 Starting InfoMe Services..."
echo ""

# Check if .env files exist
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found! Please configure it first."
    exit 1
fi

if [ ! -f "scraper/.env" ]; then
    echo "❌ scraper/.env not found! Please configure it first."
    exit 1
fi

# Start Frontend
echo "📱 Starting Next.js Frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait a bit
sleep 3

# Start Backend API
echo "🐍 Starting Python Backend API..."
cd scraper
python api_server.py &
BACKEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🐍 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $FRONTEND_PID $BACKEND_PID; exit" INT
wait
