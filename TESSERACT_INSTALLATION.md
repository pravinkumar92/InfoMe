# Tesseract OCR Installation Guide

## What is Tesseract?
Tesseract is an OCR (Optical Character Recognition) engine that extracts text from images and scanned PDFs. It's required for processing:
- Scanned PDF documents
- Image files (JPG, PNG)
- PDFs with embedded images

## Installation Steps for Windows

### Option 1: Using the Installer (Recommended)

1. **Download Tesseract Installer**
   - Visit: https://github.com/UB-Mannheim/tesseract/wiki
   - Download the latest Windows installer (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Follow the installation wizard
   - **Important**: Note the installation path (default is `C:\Program Files\Tesseract-OCR`)
   - Make sure to check "Add to PATH" during installation

3. **Verify Installation**
   Open Command Prompt and run:
   ```bash
   tesseract --version
   ```
   You should see the Tesseract version information.

### Option 2: Using Chocolatey

If you have Chocolatey package manager installed:

```bash
choco install tesseract
```

### Option 3: Using Scoop

If you have Scoop package manager installed:

```bash
scoop install tesseract
```

## Post-Installation

### 1. Verify PATH
Make sure Tesseract is in your system PATH:
- Open Command Prompt
- Run: `tesseract --version`
- If it doesn't work, add Tesseract to PATH manually:
  1. Search for "Environment Variables" in Windows
  2. Click "Environment Variables"
  3. Under "System variables", find "Path"
  4. Click "Edit"
  5. Click "New"
  6. Add: `C:\Program Files\Tesseract-OCR`
  7. Click "OK" on all dialogs
  8. Restart your terminal/IDE

### 2. Restart Your Application
After installing Tesseract:
1. Stop the Python backend server (Ctrl+C)
2. Restart it using:
   ```bash
   cd scraper
   python api_server.py
   ```

## Testing Tesseract

Run this command to test if Tesseract is working:

```bash
tesseract --list-langs
```

This should show available languages (at least `eng` for English).

## Common Installation Paths

The file processor will automatically check these paths:
- `C:\Program Files\Tesseract-OCR\tesseract.exe`
- `C:\Program Files (x86)\Tesseract-OCR\tesseract.exe`
- `C:\Users\[YourUsername]\AppData\Local\Programs\Tesseract-OCR\tesseract.exe`

## Troubleshooting

### Error: "tesseract is not installed or it's not in your PATH"

**Solution 1**: Install Tesseract using the steps above

**Solution 2**: If already installed, add to PATH manually

**Solution 3**: Restart your terminal/IDE after installation

### Error: "Failed to load language data"

**Solution**: Reinstall Tesseract and make sure to include language data during installation

### PDFs with Text Work, But Scanned PDFs Don't

This is expected if Tesseract is not installed. Regular PDFs with selectable text don't need OCR, but scanned PDFs (images) require Tesseract.

## Alternative: Process Text-Based PDFs Only

If you don't want to install Tesseract, you can still process:
- ✅ Regular PDFs with selectable text
- ✅ Plain text files (.txt)
- ❌ Scanned PDFs (will fail)
- ❌ Image files (will fail)

The application will work for most government notices as they're usually text-based PDFs.

## Quick Start Commands

After installation, restart your backend:

```bash
# Stop current backend (Ctrl+C)

# Navigate to scraper directory
cd scraper

# Restart the API server
python api_server.py
```

Or use the start script:

```bash
# Windows
start-all.bat

# Linux/Mac
./start-all.sh
```

## Additional Languages

To add support for other languages (Hindi, etc.):

1. Download language data from: https://github.com/tesseract-ocr/tessdata
2. Place `.traineddata` files in: `C:\Program Files\Tesseract-OCR\tessdata\`
3. For Hindi: Download `hin.traineddata`

## Need Help?

If you continue to face issues:
1. Check that Tesseract is installed: `tesseract --version`
2. Check PATH is set correctly
3. Restart your terminal/IDE
4. Restart the Python backend server
5. Try uploading a text-based PDF first (not scanned)

## Download Links

- **Tesseract Windows Installer**: https://github.com/UB-Mannheim/tesseract/wiki
- **Tesseract Documentation**: https://tesseract-ocr.github.io/
- **Language Data**: https://github.com/tesseract-ocr/tessdata
