@echo off
REM ============================================================================
REM Computer Store Kansas - Flyer Generator Silent Installer
REM For automated deployment to multiple computers via Group Policy or scripts
REM ============================================================================

setlocal EnableDelayedExpansion

REM Silent mode - no prompts, no pauses
set "SILENT_MODE=1"
set "CREATE_DESKTOP_SHORTCUT=1"
set "AUTO_INSTALL_PYTHON=1"

REM Log file location
set "LOG_FILE=%TEMP%\FlyerGenerator_Install.log"

echo Installation started at %date% %time% > "%LOG_FILE%"

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Administrator privileges required >> "%LOG_FILE%"
    exit /b 1
)

echo Checking for Python... >> "%LOG_FILE%"

REM Check if Python is installed
python --version >nul 2>&1
if %errorLevel% neq 0 (
    if %AUTO_INSTALL_PYTHON% equ 1 (
        echo Python not found. Installing... >> "%LOG_FILE%"
        
        REM Download Python installer
        powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe' -OutFile '%TEMP%\python_installer.exe'" >> "%LOG_FILE%" 2>&1
        
        if exist "%TEMP%\python_installer.exe" (
            REM Install Python silently
            "%TEMP%\python_installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_pip=1 >> "%LOG_FILE%" 2>&1
            timeout /t 30 /nobreak >nul
            
            del "%TEMP%\python_installer.exe"
            echo Python installed >> "%LOG_FILE%"
        ) else (
            echo ERROR: Failed to download Python >> "%LOG_FILE%"
            exit /b 1
        )
    ) else (
        echo ERROR: Python not installed >> "%LOG_FILE%"
        exit /b 1
    )
) else (
    echo Python detected >> "%LOG_FILE%"
)

REM Set installation directory
set "INSTALL_DIR=%ProgramFiles%\ComputerStoreKS\FlyerGenerator"
set "SCRIPT_DIR=%~dp0"

echo Verifying source files... >> "%LOG_FILE%"
echo Script location: %SCRIPT_DIR% >> "%LOG_FILE%"

REM Check if required files exist
set "MISSING_FILES=0"
set "REQUIRED_FILES=flyer_generator.py Desktop_sales-flyer.html Laptop_sales-flyer.html sales-flyer.css title.png graphics-icon.png requirements.txt"

for %%F in (%REQUIRED_FILES%) do (
    if not exist "%SCRIPT_DIR%%%F" (
        echo ERROR: Missing file: %%F >> "%LOG_FILE%"
        set "MISSING_FILES=1"
    ) else (
        echo Found: %%F >> "%LOG_FILE%"
    )
)

if %MISSING_FILES% equ 1 (
    echo ERROR: Some required files are missing >> "%LOG_FILE%"
    echo Current location: %SCRIPT_DIR% >> "%LOG_FILE%"
    exit /b 1
)

echo All required files found >> "%LOG_FILE%"

echo Installing to: %INSTALL_DIR% >> "%LOG_FILE%"

REM Create installation directory
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%" >> "%LOG_FILE%" 2>&1
)

REM Copy files
echo Copying files... >> "%LOG_FILE%"
for %%F in (%REQUIRED_FILES%) do (
    echo Copying: %%F >> "%LOG_FILE%"
    copy /Y "%SCRIPT_DIR%%%F" "%INSTALL_DIR%\" >> "%LOG_FILE%" 2>&1
    if !errorlevel! neq 0 (
        echo ERROR: Failed to copy %%F >> "%LOG_FILE%"
        exit /b 1
    )
)

REM Copy optional documentation files
if exist "%SCRIPT_DIR%README.md" copy /Y "%SCRIPT_DIR%README.md" "%INSTALL_DIR%\" >> "%LOG_FILE%" 2>&1
if exist "%SCRIPT_DIR%QUICKSTART.txt" copy /Y "%SCRIPT_DIR%QUICKSTART.txt" "%INSTALL_DIR%\" >> "%LOG_FILE%" 2>&1

REM Install Python dependencies
echo Installing dependencies... >> "%LOG_FILE%"
cd /d "%INSTALL_DIR%"
python -m pip install --upgrade pip >> "%LOG_FILE%" 2>&1
python -m pip install xhtml2pdf pillow reportlab >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo WARNING: Dependency installation had errors >> "%LOG_FILE%"
)

REM Create Start Menu directory
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs\Computer Store Kansas"
if not exist "%START_MENU%" mkdir "%START_MENU%" >> "%LOG_FILE%" 2>&1

REM Create launcher files
echo @echo off > "%INSTALL_DIR%\Launch_Flyer_Generator.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%\Launch_Flyer_Generator.bat"
echo python flyer_generator.py >> "%INSTALL_DIR%\Launch_Flyer_Generator.bat"

echo Set oShell = CreateObject("WScript.Shell") > "%INSTALL_DIR%\Launch_Flyer_Generator.vbs"
echo oShell.Run """%INSTALL_DIR%\Launch_Flyer_Generator.bat""", 0, True >> "%INSTALL_DIR%\Launch_Flyer_Generator.vbs"

REM Create shortcuts
echo Creating shortcuts... >> "%LOG_FILE%"
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%START_MENU%\Flyer Generator.lnk'); $s.TargetPath = '%INSTALL_DIR%\Launch_Flyer_Generator.vbs'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'Computer Store Kansas Flyer Generator'; $s.Save()" >> "%LOG_FILE%" 2>&1

if %CREATE_DESKTOP_SHORTCUT% equ 1 (
    REM Create desktop shortcut for all users
    powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%PUBLIC%\Desktop\Flyer Generator.lnk'); $s.TargetPath = '%INSTALL_DIR%\Launch_Flyer_Generator.vbs'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'Computer Store Kansas Flyer Generator'; $s.Save()" >> "%LOG_FILE%" 2>&1
)

REM Create uninstaller
echo @echo off > "%INSTALL_DIR%\Uninstall.bat"
echo echo Uninstalling Flyer Generator... >> "%INSTALL_DIR%\Uninstall.bat"
echo rd /s /q "%INSTALL_DIR%" >> "%INSTALL_DIR%\Uninstall.bat"
echo del "%START_MENU%\Flyer Generator.lnk" >> "%INSTALL_DIR%\Uninstall.bat"
echo del "%PUBLIC%\Desktop\Flyer Generator.lnk" 2^>nul >> "%INSTALL_DIR%\Uninstall.bat"
echo del "%USERPROFILE%\Desktop\Flyer Generator.lnk" 2^>nul >> "%INSTALL_DIR%\Uninstall.bat"
echo echo Uninstall complete! >> "%INSTALL_DIR%\Uninstall.bat"
echo pause >> "%INSTALL_DIR%\Uninstall.bat"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%START_MENU%\Uninstall Flyer Generator.lnk'); $s.TargetPath = '%INSTALL_DIR%\Uninstall.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Save()" >> "%LOG_FILE%" 2>&1

echo Installation completed successfully at %date% %time% >> "%LOG_FILE%"
echo Installation log saved to: %LOG_FILE%

exit /b 0
