@echo off
title MedVault Launcher
echo ===================================================
echo             MedVault System Launcher
echo ===================================================
echo.

:: Check for Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH. Please install JDK 21.
    pause
    exit /b
)

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node 20+.
    pause
    exit /b
)

echo Starting Spring Boot Backend (Port 8080)...
set DB_PASSWORD=Devil@312
set JWT_SECRET=9a67471b79f8cfb7519a0f44358a98c76bf864f1bc093cf1a80c98f8287e07a3
start "MedVault Backend" cmd /k "cd backend && mvn spring-boot:run"

echo Starting React + Vite Frontend (Port 5173)...
start "MedVault Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 8 seconds for servers to start before opening browser...
timeout /t 8 /nobreak >nul

echo Opening MedVault Admin Portal in browser...
start http://localhost:5173/admin/login

echo.
echo ===================================================
echo  All services started! You can close this window.
echo ===================================================
timeout /t 5 >nul
exit
