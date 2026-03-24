@echo off
echo ========================================
echo   Sistema de Convites Digitais
echo ========================================
echo.

:: Obter IP local automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo IP da maquina: %IP%
echo.

echo [1/2] Iniciando Backend na porta 5000...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 4 /nobreak >nul

echo [2/2] Iniciando Frontend na porta 3000...
start "Frontend" cmd /k "cd /d %~dp0 && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Sistema Iniciado!
echo ========================================
echo.
echo Esta maquina:
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:5000
echo.
echo Outras maquinas na rede:
echo   Frontend : http://%IP%:3000
echo   Convite  : http://%IP%:3000/convite/[ID]
echo.
echo Partilha o link ou QR code com os convidados!
echo.
pause
