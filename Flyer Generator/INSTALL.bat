@echo off
REM ============================================================================
REM Computer Store Kansas - Flyer Generator Installer
REM Automated installation script for Windows
REM ============================================================================

setlocal EnableDelayedExpansion

echo.
echo ========================================================================
echo    Computer Store Kansas - Sales Flyer Generator
echo    Automated Installer v1.0
echo ========================================================================
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo Please right-click and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo [1/6] Checking system requirements...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo.
    echo Would you like to:
    echo   1. Install Python automatically ^(recommended^)
    echo   2. Install manually and run this installer again
    echo   3. Cancel installation
    echo.
    choice /C 123 /N /M "Enter your choice (1-3): "
    
    if !errorlevel! equ 1 (
        echo.
        echo Downloading Python installer...
        powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe' -OutFile '%TEMP%\python_installer.exe'"
        
        if exist "%TEMP%\python_installer.exe" (
            echo Installing Python... This may take a few minutes...
            "%TEMP%\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_pip=1
            
            echo Waiting for installation to complete...
            timeout /t 30 /nobreak >nul
            
            REM Refresh environment variables
            call refreshenv.cmd >nul 2>&1
            
            REM Verify installation
            python --version >nul 2>&1
            if !errorLevel! neq 0 (
                echo ERROR: Python installation failed or PATH not updated.
                echo Please restart your computer and run this installer again.
                pause
                exit /b 1
            )
            
            del "%TEMP%\python_installer.exe"
            echo Python installed successfully!
        ) else (
            echo ERROR: Failed to download Python installer.
            echo Please install Python manually from python.org
            pause
            exit /b 1
        )
    ) else if !errorlevel! equ 2 (
        echo Please install Python from: https://www.python.org/downloads/
        echo Make sure to check "Add Python to PATH" during installation.
        start https://www.python.org/downloads/
        pause
        exit /b 0
    ) else (
        echo Installation cancelled.
        pause
        exit /b 0
    )
)

echo ✓ Python detected
python --version
echo.

REM Set installation directory
set "INSTALL_DIR=%ProgramFiles%\ComputerStoreKS\FlyerGenerator"
set "SCRIPT_DIR=%~dp0"

echo [2/6] Verifying source files...
echo Script location: %SCRIPT_DIR%
echo.

REM Check if required files exist
set "MISSING_FILES=0"
set "REQUIRED_FILES=flyer_generator.py Desktop_sales-flyer.html Laptop_sales-flyer.html sales-flyer.css title.png graphics-icon.png requirements.txt"

for %%F in (%REQUIRED_FILES%) do (
    if not exist "%SCRIPT_DIR%%%F" (
        echo ERROR: Missing file: %%F
        set "MISSING_FILES=1"
    ) else (
        echo   ✓ Found: %%F
    )
)

if %MISSING_FILES% equ 1 (
    echo.
    echo ERROR: Some required files are missing!
    echo.
    echo SOLUTION:
    echo 1. Make sure you extracted ALL files from the package
    echo 2. Run this installer FROM INSIDE the FlyerGenerator_Package folder
    echo 3. Do not move the installer to a different location
    echo.
    echo Current location: %SCRIPT_DIR%
    echo.
    pause
    exit /b 1
)

echo   ✓ All required files found!
echo.

echo [3/6] Creating installation directory...
echo Installing to: %INSTALL_DIR%
echo.

if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
)

echo [4/6] Copying application files...
echo.

REM Copy all necessary files
for %%F in (%REQUIRED_FILES%) do (
    echo Copying: %%F
    copy /Y "%SCRIPT_DIR%%%F" "%INSTALL_DIR%\" >nul
    if !errorlevel! neq 0 (
        echo ERROR: Failed to copy %%F
        pause
        exit /b 1
    )
)

REM Copy optional documentation files
if exist "%SCRIPT_DIR%README.md" copy /Y "%SCRIPT_DIR%README.md" "%INSTALL_DIR%\" >nul
if exist "%SCRIPT_DIR%QUICKSTART.txt" copy /Y "%SCRIPT_DIR%QUICKSTART.txt" "%INSTALL_DIR%\" >nul

echo ✓ Files copied successfully
echo.

echo [5/6] Installing Python dependencies...
echo This may take a few minutes...
echo.

cd /d "%INSTALL_DIR%"
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo WARNING: Some dependencies may have failed to install.
    echo The application might not work correctly.
    echo.
    pause
)

echo ✓ Dependencies installed
echo.

echo [6/6] Creating shortcuts...
echo.

REM Create Start Menu shortcut
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs\Computer Store Kansas"
if not exist "%START_MENU%" mkdir "%START_MENU%"

REM Create launcher batch file
echo @echo off > "%INSTALL_DIR%\Launch_Flyer_Generator.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%\Launch_Flyer_Generator.bat"
echo python flyer_generator.py >> "%INSTALL_DIR%\Launch_Flyer_Generator.bat"

REM Create VBS file to run without console window
echo Set oShell = CreateObject("WScript.Shell") > "%INSTALL_DIR%\Launch_Flyer_Generator.vbs"
echo oShell.Run """%INSTALL_DIR%\Launch_Flyer_Generator.bat""", 0, True >> "%INSTALL_DIR%\Launch_Flyer_Generator.vbs"

REM Create Start Menu shortcut
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%START_MENU%\Flyer Generator.lnk'); $s.TargetPath = '%INSTALL_DIR%\Launch_Flyer_Generator.vbs'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'Computer Store Kansas Flyer Generator'; $s.Save()"

REM Create Desktop shortcut (optional)
echo.
choice /C YN /M "Create desktop shortcut?"
if !errorlevel! equ 1 (
    powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\Flyer Generator.lnk'); $s.TargetPath = '%INSTALL_DIR%\Launch_Flyer_Generator.vbs'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'Computer Store Kansas Flyer Generator'; $s.Save()"
    echo ✓ Desktop shortcut created
) else (
    echo Desktop shortcut skipped
)

echo ✓ Start Menu shortcut created
echo.

REM Create uninstaller
echo @echo off > "%INSTALL_DIR%\Uninstall.bat"
echo echo Uninstalling Flyer Generator... >> "%INSTALL_DIR%\Uninstall.bat"
echo rd /s /q "%INSTALL_DIR%" >> "%INSTALL_DIR%\Uninstall.bat"
echo del "%START_MENU%\Flyer Generator.lnk" >> "%INSTALL_DIR%\Uninstall.bat"
echo del "%USERPROFILE%\Desktop\Flyer Generator.lnk" 2^>nul >> "%INSTALL_DIR%\Uninstall.bat"
echo echo Uninstall complete! >> "%INSTALL_DIR%\Uninstall.bat"
echo pause >> "%INSTALL_DIR%\Uninstall.bat"

REM Add uninstaller to Start Menu
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%START_MENU%\Uninstall Flyer Generator.lnk'); $s.TargetPath = '%INSTALL_DIR%\Uninstall.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Save()"

echo ✓ Uninstaller created
echo.

echo ========================================================================
echo    Installation Complete!
echo ========================================================================
echo.
echo The Flyer Generator has been installed to:
echo   %INSTALL_DIR%
echo.
echo You can launch it from:
echo   - Start Menu ^> Computer Store Kansas ^> Flyer Generator
if exist "%USERPROFILE%\Desktop\Flyer Generator.lnk" (
    echo   - Desktop shortcut
)
echo.
echo Documentation is available at:
echo   %INSTALL_DIR%\README.md
echo   %INSTALL_DIR%\QUICKSTART.txt
echo.
echo To uninstall, use:
echo   Start Menu ^> Computer Store Kansas ^> Uninstall Flyer Generator
echo.
echo ========================================================================
echo.

choice /C YN /M "Would you like to launch the application now?"
if !errorlevel! equ 1 (
    start "" "%INSTALL_DIR%\Launch_Flyer_Generator.vbs"
)

echo.
echo Thank you for using Computer Store Kansas Flyer Generator!
echo.
pause
