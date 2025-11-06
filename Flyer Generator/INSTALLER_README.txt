================================================================================
   COMPUTER STORE KANSAS - FLYER GENERATOR INSTALLERS
================================================================================

⚡ QUICK START - CHOOSE YOUR INSTALLER:
---------------------------------------

🟢 INSTALLING ON 1-5 COMPUTERS MANUALLY?
   → Use: INSTALL.bat
   → Right-click → Run as Administrator
   → Follow the prompts

🔵 DEPLOYING TO MANY COMPUTERS AUTOMATICALLY?
   → Use: INSTALL_SILENT.bat
   → See: INSTALLER_GUIDE.txt for deployment methods
   → Works with Group Policy, SCCM, scripts

🟣 WANT A PROFESSIONAL INSTALLER PACKAGE?
   → Use: flyer_generator_setup.iss (requires Inno Setup)
   → Creates a single .exe installer
   → See: INSTALLER_GUIDE.txt for instructions


================================================================================
WHAT EACH INSTALLER DOES:
================================================================================

INSTALL.bat (Interactive)
- ✓ Checks for Python, offers to install it
- ✓ Asks questions during installation
- ✓ Creates shortcuts
- ✓ Takes 5-10 minutes
- ⏱️ Best for: 1-5 computers

INSTALL_SILENT.bat (Automated)
- ✓ No questions asked - fully automated
- ✓ Perfect for mass deployment
- ✓ Logs everything for troubleshooting
- ✓ Takes 3-5 minutes
- ⏱️ Best for: 10+ computers

flyer_generator_setup.iss (Professional)
- ✓ Creates a Windows installer (.exe)
- ✓ Professional installation wizard
- ✓ Requires Inno Setup to build
- ✓ Single file distribution
- ⏱️ Best for: Creating a distributable package


================================================================================
QUICK INSTALLATION (INTERACTIVE):
================================================================================

1. Right-click INSTALL.bat
2. Select "Run as Administrator"
3. Answer the prompts
4. Done! Launch from Start Menu


================================================================================
NEED DETAILED INSTRUCTIONS?
================================================================================

📖 Read: INSTALLER_GUIDE.txt (in this folder)

It contains:
- Complete step-by-step instructions
- Group Policy deployment guide
- Troubleshooting help
- Best practices for mass deployment


================================================================================
FILES IN THIS PACKAGE:
================================================================================

INSTALLERS:
- INSTALL.bat                    - Interactive installer
- INSTALL_SILENT.bat             - Silent/automated installer
- flyer_generator_setup.iss      - Inno Setup script

APPLICATION FILES:
- flyer_generator.py             - Main application
- Desktop_sales-flyer.html       - Desktop template
- Laptop_sales-flyer.html        - Laptop template
- sales-flyer.css                - Stylesheet
- title.png                      - Logo
- graphics-icon.png              - Icon
- requirements.txt               - Python dependencies

BUILD FILES:
- build.bat                      - Windows executable builder
- build.sh                       - Linux/Mac executable builder
- flyer_generator.spec           - PyInstaller config

DOCUMENTATION:
- README.md                      - Full documentation
- QUICKSTART.txt                 - Quick start guide
- DEPLOYMENT_GUIDE.txt           - Deployment strategies
- INSTALLER_GUIDE.txt            - This detailed guide
- index.html                     - Overview page


================================================================================
INSTALLATION LOCATIONS:
================================================================================

Installs to:        C:\Program Files\ComputerStoreKS\FlyerGenerator\
Start Menu:         Programs > Computer Store Kansas > Flyer Generator
Desktop Shortcut:   Flyer Generator (optional)


================================================================================
SYSTEM REQUIREMENTS:
================================================================================

- Windows 10 or newer
- 2GB RAM minimum
- 100MB disk space
- Python 3.8+ (installer can install it for you)
- Internet connection (for Python/dependency downloads)


================================================================================
TROUBLESHOOTING:
================================================================================

❌ "Access Denied"
   → Run as Administrator (right-click installer)

❌ Python won't install
   → Check internet connection
   → Manually install from python.org

❌ Dependencies fail
   → Run: pip install xhtml2pdf pillow
   → Check log: %TEMP%\FlyerGenerator_Install.log

❌ Application won't start
   → Verify Python installed: python --version
   → Check Program Files folder exists


================================================================================
SUPPORT:
================================================================================

For installation help:
1. Read INSTALLER_GUIDE.txt (detailed help)
2. Check the log file (for silent installs)
3. Contact IT support with error details


================================================================================
VERSION INFORMATION:
================================================================================

Application Version: 1.0
Release Date: November 2025
Created for: Computer Store Kansas

================================================================================
