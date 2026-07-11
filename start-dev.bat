@echo off
set "ROOT=%~dp0"

echo Starting GoldTrade Development Environment...
echo.

echo [1/2] Starting Spring Boot backend on http://localhost:8080
start "GoldTrade Backend" powershell.exe -ExecutionPolicy Bypass -NoExit -File "%ROOT%backend\start.ps1"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Next.js frontend on http://localhost:3000
start "GoldTrade Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

echo.
echo Both servers starting in separate windows:
echo.
echo   Backend API:        http://localhost:8080
echo.
echo   Landing Page:       http://localhost:3000/
echo   Login:              http://localhost:3000/login
echo   Join:               http://localhost:3000/join
echo   Investor Dashboard: http://localhost:3000/investor/dashboard
echo   Admin Overview:     http://localhost:3000/admin/overview
echo.
