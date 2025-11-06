#!/bin/bash

echo "Building Flyer Generator Executable..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    exit 1
fi

echo "Installing dependencies..."
pip3 install -r requirements.txt

echo ""
echo "Building executable with PyInstaller..."
pyinstaller flyer_generator.spec --clean

echo ""
if [ -f "dist/FlyerGenerator" ]; then
    echo "Build successful!"
    echo "Executable location: dist/FlyerGenerator"
    echo ""
    echo "You can now distribute the FlyerGenerator executable."
else
    echo "Build failed! Check the output above for errors."
fi
