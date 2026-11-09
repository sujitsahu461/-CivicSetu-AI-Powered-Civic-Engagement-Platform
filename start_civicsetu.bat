@echo off
title CivicSetu - AI-Powered Civic Engagement Platform
cd /d "%~dp0"

echo ===================================================================
echo           CivicSetu - AI-Powered Civic Redressal Platform          
echo ===================================================================
echo.
echo [1/2] Opening Web Application in Browser: http://127.0.0.1:8000/
start http://127.0.0.1:8000/
echo.
echo [2/2] Launching Django Server (API + Built React SPA)...
echo Swagger Docs:  http://127.0.0.1:8000/api/docs/
echo Django Admin:  http://127.0.0.1:8000/admin/
echo.
set "PYTHON_CMD=python"
py -3.12 -c "import sys; assert sys.version_info[:2] == (3, 12)" >nul 2>&1
if not errorlevel 1 set "PYTHON_CMD=py -3.12"
echo Press Ctrl+C in this window to stop the server anytime.
echo ===================================================================
echo.
%PYTHON_CMD% manage.py runserver 127.0.0.1:8000
pause
