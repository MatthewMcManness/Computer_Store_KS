# Gallery Manager User Guide
## Computer Store Kansas Website

### What is Gallery Manager?

Gallery Manager is a desktop application that lets you easily manage the computers displayed on your website gallery **without needing any technical or coding knowledge**. You can add new computers, edit existing ones, delete them, and publish your changes to the website—all with a simple point-and-click interface!

---

## Installation

### Step 1: Install Python Requirements

The Gallery Manager requires a few Python packages. Open a terminal/command prompt in your project folder and run:

```bash
uv pip install customtkinter pillow beautifulsoup4
```

Or if you don't have `uv`:

```bash
pip install customtkinter pillow beautifulsoup4
```

### Step 2: Launch the Application

Double-click `gallery_manager.py` or run:

```bash
python gallery_manager.py
```

---

## How to Use

### Main Window Overview

When you open Gallery Manager, you'll see three main sections:

```
┌─────────────┬──────────────────┬──────────────┐
│  Computer   │     Preview      │ Git Actions  │
│    List     │                  │              │
│             │                  │              │
│  [Filters]  │  [Selected       │ [Check       │
│             │   Computer       │  Status]     │
│  Desktop 1  │   Details]       │              │
│  Desktop 2  │                  │ [Publish     │
│  Laptop 1   │                  │  Changes]    │
│     ...     │                  │              │
│             │                  │              │
│ [Add New]   │                  │ [Status      │
│ [Edit]      │                  │  Display]    │
│ [Delete]    │                  │              │
└─────────────┴──────────────────┴──────────────┘
```

#### Left Panel - Computer List
- Shows all computers in your gallery
- Filter by: All, Desktop, Laptop, Custom, or Refurbished
- Click any computer to see a preview
- Three action buttons at the bottom

#### Middle Panel - Preview
- Shows how the selected computer will look on your website
- Displays image, badge, name, price, and specs
- Updates when you click a different computer

#### Right Panel - Git Actions
- Check what files have been changed
- Publish (commit & push) your changes to update the website
- Shows Git status and help information

---

## Common Tasks

### 1. Adding a New Computer

1. Click the **"Add New"** button in the left panel
2. Fill in the form:
   - **Computer Name**: e.g., "Gaming Pro Desktop"
   - **Type**: Choose Desktop or Laptop
   - **Category**: Choose Custom Build or Refurbished
   - **Price**: e.g., "$1,299" (include the $ sign)
   - **Image**: Click "Choose Image" and select a photo
   - **Specifications**: Fill in 4 specs (Label + Value)
     - Example: CPU → Intel Core i7-12700K
     - Example: RAM → 32GB DDR4
     - Example: Storage → 1TB NVMe SSD
     - Example: Graphics → RTX 3070
3. Click **"Save"**
4. The computer is added to your gallery!

**Note**: The image will be automatically optimized and renamed for the web.

### 2. Editing an Existing Computer

1. Click on the computer you want to edit in the left panel
2. Click the **"Edit Selected"** button
3. Make your changes in the form
4. Click **"Save"**
5. The computer is updated!

### 3. Deleting a Computer

1. Click on the computer you want to delete
2. Click the **"Delete Selected"** button
3. Choose one of three options:
   - **Yes**: Delete the computer AND its image file
   - **No**: Delete the computer but keep the image file
   - **Cancel**: Don't delete anything
4. The computer is removed!

### 4. Publishing Changes to the Website

After you make changes (add, edit, or delete computers), you need to publish them:

1. Click **"Check Git Status"** to see what changed (optional)
2. Click **"Publish Changes"**
3. Confirm you want to publish
4. Wait for the progress dialog to finish
5. Your website is updated! 🎉

**What happens when you publish:**
- Your changes are saved to Git (version control)
- Changes are pushed to the online repository
- The website updates automatically (depending on your hosting setup)

---

## Tips & Best Practices

### Images
- **Recommended size**: 1200x900 pixels (4:3 ratio)
- **Format**: JPG or PNG (will be converted to JPG automatically)
- **File size**: Keep under 2MB for best performance
- Images are automatically optimized and resized

### Specifications
- Always fill in all 4 spec fields for consistency
- Use clear, concise labels (CPU, RAM, Storage, Graphics, Display, etc.)
- For desktops: CPU, RAM, Storage, Graphics
- For laptops: CPU, RAM, Storage, Display

### Prices
- Always include the $ sign: "$1,299" not "1299"
- Use commas for thousands: "$1,299" not "$1299"
- Keep pricing consistent across similar products

### Categories
- **Custom Build**: For computers you've built from scratch
- **Refurbished**: For pre-owned computers that have been restored

---

## Safety Features

### Automatic Backups
Every time you save a change, Gallery Manager automatically creates a backup of your HTML file in the `backups/` folder with a timestamp. If something goes wrong, you can restore from a backup!

### Validation
The app won't let you save if:
- Computer name is empty
- Price is empty
- No image is selected
- No specifications are filled in

### Git Safety
- Changes are only published when you click "Publish Changes"
- You can make multiple edits before publishing
- All changes are tracked in Git (you can undo if needed)

---

## Troubleshooting

### "Git is not installed or not in PATH"
**Solution**: Make sure Git is installed on your computer. Download from [git-scm.com](https://git-scm.com/)

### "HTML file not found"
**Solution**: Make sure you're running the Gallery Manager from the correct folder (the one containing `index.html`)

### Image won't upload
**Solution**:
- Check that the image file isn't corrupted
- Try a different image format (JPG or PNG)
- Make sure the file size is reasonable (under 10MB)

### Changes not showing on website
**Solution**:
1. Make sure you clicked "Publish Changes"
2. Check Git status to see if changes were committed
3. Wait a few minutes for your hosting to update
4. Clear your browser cache (Ctrl+F5)

### Application won't start
**Solution**:
1. Make sure Python is installed
2. Install required packages: `pip install customtkinter pillow beautifulsoup4`
3. Check that you're in the right directory

---

## File Structure

```
Computer_Store_KS/
├── gallery_manager.py          ← The app (double-click to run)
├── index.html                  ← Your website (managed by app)
├── assets/
│   └── gallery/               ← Computer images (managed by app)
│       ├── desktop-1.jpg
│       ├── laptop-1.jpg
│       └── ...
├── backups/                   ← Automatic backups
│   └── index_backup_YYYYMMDD_HHMMSS.html
└── GALLERY_MANAGER_README.md  ← This file
```

---

## Keyboard Shortcuts

- **Ctrl+N**: Add new computer (when implemented)
- **Delete**: Delete selected computer (when implemented)
- **Ctrl+S**: Save changes (in dialogs)
- **Esc**: Cancel/Close dialog

---

## Workflow Example

Here's a typical workflow for updating your gallery:

1. **Launch Gallery Manager**
   ```
   python gallery_manager.py
   ```

2. **Add a new gaming computer**
   - Click "Add New"
   - Name: "Ultimate Gaming PC"
   - Type: Desktop
   - Category: Custom Build
   - Price: "$2,499"
   - Upload image from your photos
   - Add specs:
     - CPU: Intel Core i9-13900K
     - RAM: 64GB DDR5
     - Storage: 2TB NVMe SSD
     - Graphics: RTX 4080
   - Click Save

3. **Edit an existing laptop**
   - Click on "Business Laptop" in the list
   - Click "Edit Selected"
   - Change price from "$799" to "$699"
   - Update RAM spec from "8GB" to "16GB"
   - Click Save

4. **Delete an old computer**
   - Click on "Old Model Desktop"
   - Click "Delete Selected"
   - Choose "Yes" to delete image too
   - Confirm

5. **Publish everything**
   - Click "Publish Changes"
   - Confirm
   - Wait for success message
   - Done! Your website is updated

---

## Support & Questions

If you run into issues:

1. Check the **Git Status** panel for error messages
2. Look in the **backups/** folder for recent backups
3. Check the status bar at the bottom of the window for messages
4. Try closing and reopening the app

For technical issues, check:
- Git is installed and configured
- You have write permissions to the folder
- Internet connection is working (for publishing)

---

## Advanced Features

### Manual Backup Restoration
If you need to restore from a backup:
1. Close Gallery Manager
2. Go to the `backups/` folder
3. Find the backup you want (sorted by date/time)
4. Copy it and rename it to `index.html`
5. Replace the current `index.html`
6. Reopen Gallery Manager

### Bulk Operations
To add many computers quickly:
- Use "Add New" repeatedly
- Don't publish until you've added all of them
- Then publish once at the end

### Image Naming
Images are automatically renamed to:
- `desktop-1.jpg`, `desktop-2.jpg`, etc. for desktops
- `laptop-1.jpg`, `laptop-2.jpg`, etc. for laptops

---

## Version Information

- **Application**: Gallery Manager v1.0
- **Author**: Kaya (Claude Code Assistant)
- **Date**: 2025
- **Framework**: CustomTkinter (Python)
- **Requirements**: Python 3.7+, customtkinter, Pillow, BeautifulSoup4

---

## What's Next?

Your Gallery Manager is ready to use! Start by:

1. ✅ Opening the app
2. ✅ Looking at your current computers
3. ✅ Try editing one to get familiar
4. ✅ Add a new computer
5. ✅ Publish your changes

**Happy gallery managing! 🖥️✨**
