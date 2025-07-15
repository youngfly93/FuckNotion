@echo off
echo Setting UTF-8 encoding for development...
chcp 65001 > nul

echo Starting FuckNotion Web Development Server...
echo.
echo Web app will be available at: http://localhost:3000
echo.

start "FuckNotion Headless" cmd /k "cd packages\headless && npx tsup --watch"
start "FuckNotion Web App" cmd /k "cd apps\web && npx next dev -H 0.0.0.0"

echo.
echo Development servers started!
echo - Web App: http://localhost:3000
echo - Headless package building in watch mode
echo.
echo Press any key to exit...
pause > nul
