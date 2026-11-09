@echo off
title CivicSetu - Concurrent Development Mode (Django + Vite HMR)
cd /d "%~dp0"

echo ===================================================================
echo     CivicSetu - Concurrent Mode (Django API :8000 + Vite :5173)    
echo ===================================================================
echo.
echo Starting Django Backend in a separate window...
set "PYTHON_CMD=python"
py -3.12 -c "import sys; assert sys.version_info[:2] == (3, 12)" >nul 2>&1
if not errorlevel 1 set "PYTHON_CMD=py -3.12"
start "CivicSetu Django Backend (:8000)" cmd /k "%PYTHON_CMD% manage.py runserver 127.0.0.1:8000"

echo Starting Vite React Dev Server in a separate window...
start "CivicSetu Vite Dev Server (:5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul
echo Opening React UI in Browser: http://127.0.0.1:5173/
start http://127.0.0.1:5173/

echo.
echo Both servers are running!
echo Backend API / Admin / Docs: http://127.0.0.1:8000/
echo Vite React UI with HMR:      http://127.0.0.1:5173/
echo.
pause
