@echo off
echo ========================================
echo   Sistema de Convites Digitais
echo ========================================
echo.

echo [1/3] Verificando PostgreSQL...
timeout /t 2 /nobreak >nul

echo [2/3] Iniciando Backend...
start "Backend - Convites Digitais" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando Frontend...
start "Frontend - Convites Digitais" cmd /k "npm start"

echo.
echo ========================================
echo   Sistema Iniciado!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
