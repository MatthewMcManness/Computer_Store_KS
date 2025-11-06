# Computer Store Kansas - Sales Flyer Generator

A desktop application for creating professional PDF sales flyers for laptop and desktop computers.

## Features

- **Easy-to-use GUI** - Simple interface for entering product information
- **Dual Product Support** - Create flyers for both laptops and desktops
- **Condition Options** - Different warranty information for new vs refurbished items
- **PDF Export** - Save flyers as professional PDF documents
- **HTML Preview** - Preview your flyer in a web browser before saving

## Installation

### Option 1: Run the Pre-built Executable (Easiest)

1. Download `FlyerGenerator.exe` (Windows) or `FlyerGenerator` (Mac/Linux)
2. Double-click to run - no installation needed!

### Option 2: Build from Source

#### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

#### Steps

1. **Download/Extract all files** to a folder:
   - `flyer_generator.py`
   - `Desktop_sales-flyer.html`
   - `Laptop_sales-flyer.html`
   - `sales-flyer.css`
   - `title.png`
   - `graphics-icon.png`
   - `requirements.txt`
   - `flyer_generator.spec`
   - `build.bat` (Windows) or `build.sh` (Mac/Linux)

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python flyer_generator.py
   ```

4. **Build executable (optional):**
   
   **Windows:**
   ```cmd
   build.bat
   ```
   
   **Mac/Linux:**
   ```bash
   chmod +x build.sh
   ./build.sh
   ```
   
   The executable will be created in the `dist` folder.

## Usage Guide

### Creating a Flyer

1. **Select Product Type:**
   - Choose "Laptop" or "Desktop"
   - This changes the available specs (screen size vs graphics card)

2. **Select Condition:**
   - **New**: Sets "Brand New" text and premium warranty
     - Laptops: 1 Year Manufacturer Warranty, Lifetime Free Diagnostics
     - Desktops: 1 Month Manufacturer Warranty, Lifetime Free Diagnostics
   - **Refurbished**: Sets "Newly Refurbished" text and standard warranty
     - Laptops: 90 Days Parts Warranty, 6 Months Free Diagnostics
     - Desktops: 3 Months Parts Warranty, 6 Months Free Diagnostics

3. **Enter Product Details:**
   - **Product Name**: e.g., "Dell Latitude 5420"
   - **Screen Size** (laptop) or **Graphics Card** (desktop): e.g., "15.6 inch" or "NVIDIA GTX 1660"
   - **Processor**: e.g., "Intel Core i5-1135G7"
   - **Memory**: e.g., "16GB DDR4"
   - **Storage**: e.g., "512GB NVMe SSD"
   - **Price**: e.g., "$649" or "$649.99"

4. **Preview (Optional):**
   - Click "Preview HTML" to see your flyer in a web browser
   - Make any necessary adjustments

5. **Save as PDF:**
   - Click "Save as PDF"
   - Choose a location and filename
   - Click "Save"

### Tips

- The warranty information updates automatically based on your product type and condition selections
- You can preview the HTML version before generating the PDF to check formatting
- Price formatting is flexible - add the $ symbol and decimals as desired
- All fields should be filled out for a complete flyer

## File Structure

```
FlyerGenerator/
├── flyer_generator.py         # Main application code
├── Desktop_sales-flyer.html   # Desktop flyer template
├── Laptop_sales-flyer.html    # Laptop flyer template
├── sales-flyer.css           # Shared stylesheet
├── title.png                 # Company logo
├── graphics-icon.png         # Graphics card icon
├── requirements.txt          # Python dependencies
├── flyer_generator.spec      # PyInstaller configuration
├── build.bat                 # Windows build script
└── build.sh                  # Mac/Linux build script
```

## Troubleshooting

### "PDF generation requires xhtml2pdf library" Error
- Make sure xhtml2pdf is installed: `pip install xhtml2pdf`
- On Windows, you may need to install GTK: https://xhtml2pdf.readthedocs.io/en/latest/install.html

### Images not showing in PDF
- Ensure `title.png` and `graphics-icon.png` are in the same folder as the executable
- If building from source, make sure these files are in the same directory as `flyer_generator.py`

### Build fails
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Try updating PyInstaller: `pip install --upgrade pyinstaller`
- On Mac/Linux, make sure the build script is executable: `chmod +x build.sh`

### Executable won't run
- On Windows, some antivirus software may flag the executable - add an exception if needed
- On Mac, you may need to allow the app in Security & Privacy settings
- On Linux, make sure the file has execute permissions: `chmod +x FlyerGenerator`

## Technical Details

- **Language**: Python 3
- **GUI Framework**: tkinter (built into Python)
- **PDF Generation**: xhtml2pdf
- **Executable Builder**: PyInstaller

## System Requirements

- **Operating System**: Windows 10+, macOS 10.13+, or modern Linux
- **RAM**: 2GB minimum
- **Disk Space**: 100MB for executable

## Support

For issues or questions, contact Computer Store Kansas.

## Version History

- **v1.0** - Initial release
  - Laptop and Desktop flyer support
  - New and Refurbished condition options
  - PDF export functionality
  - HTML preview feature

---

Created for Computer Store Kansas
