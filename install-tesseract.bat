@echo off
echo ========================================
echo Tesseract OCR Installation Helper
echo ========================================
echo.

REM Check if Tesseract is already installed
where tesseract >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Tesseract is already installed!
    tesseract --version
    echo.
    echo If you're still getting errors, try restarting your terminal/IDE.
    pause
    exit /b 0
)

echo Tesseract is not installed or not in PATH.
echo.
echo Installation Options:
echo.
echo 1. Download Installer (Recommended)
echo    Visit: https://github.com/UB-Mannheim/tesseract/wiki
echo    Download: tesseract-ocr-w64-setup-5.3.3.20231005.exe
echo    Run the installer and make sure to check "Add to PATH"
echo.
echo 2. Using Chocolatey (if installed)
echo    Run: choco install tesseract
echo.
echo 3. Using Scoop (if installed)
echo    Run: scoop install tesseract
echo.
echo ========================================
echo.

set /p choice="Do you want to open the download page? (Y/N): "
if /i "%choice%"=="Y" (
    start https://github.com/UB-Mannheim/tesseract/wiki
    echo.
    echo Opening download page in your browser...
    echo.
    echo After installation:
    echo 1. Restart this terminal
    echo 2. Restart your IDE
    echo 3. Restart the Python backend server
    echo.
)

echo.
echo For detailed instructions, see: TESSERACT_INSTALLATION.md
echo.
pause
