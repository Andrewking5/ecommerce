@echo off
echo Starting E-commerce Platform Development Environment...
echo.

echo Installing dependencies...
call npm install
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"
echo.

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.

echo Both servers are starting up...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul


