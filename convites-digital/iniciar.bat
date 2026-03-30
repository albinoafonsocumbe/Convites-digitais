@echo off
echo ============================================
echo   Convites Digitais - Iniciar Sistema
echo ============================================
echo.

REM Matar processos antigos na porta 5000
echo A limpar processos antigos...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo A iniciar Backend (porta 5000)...
start "Backend - Porta 5000" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 3 /nobreak >nul

echo A iniciar Frontend (porta 3000)...
start "Frontend - Porta 3000" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo ============================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ============================================
echo.
echo Mantem esta janela aberta ou fecha-a.
pause
