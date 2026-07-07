@echo off
REM ============================================================
REM  Rajat & Kamlesh - Wedding Invitation (local launcher)
REM  Double-click this file to open the site in your browser.
REM ============================================================
cd /d "%~dp0"
title Wedding Invitation Server
echo.
echo   Starting the wedding invitation site...
echo   Your browser will open automatically in a moment.
echo.
node server.js
echo.
echo   Server stopped. Press any key to close this window.
pause >nul
