@echo off
cd /d "%~dp0"

echo Iniciando Backend...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak

echo Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.

