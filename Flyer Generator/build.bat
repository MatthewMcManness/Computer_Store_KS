@echo off
echo Building Flyer Generator Executable...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Building executable with PyInstaller...
pyinstaller flyer_generator.spec --clean

echo.
if exist "dist\FlyerGenerator.exe" (
    echo Build successful!
    echo Executable location: dist\FlyerGenerator.exe
    echo.
    echo You can now distribute the FlyerGenerator.exe file.
) else (
    echo Build failed! Check the output above for errors.
)

pause
