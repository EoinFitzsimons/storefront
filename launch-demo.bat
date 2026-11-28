@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js 18 or newer, then try again.
  pause
  exit /b 1
)

call npm run build:storefront
if errorlevel 1 goto :build_failed

call npm run build:examples
if errorlevel 1 goto :build_failed

call npm run build:extension
if errorlevel 1 goto :build_failed

start "Guided Commerce Demo" /D "%~dp0" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4173/"
exit /b 0

:build_failed
echo.
echo The build failed. Review the error above before starting the demo.
pause
exit /b 1
