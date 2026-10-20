"""File processing for different file types"""
import io
import os
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from typing import Dict, Optional
import hashlib

class FileProcessor:
    def __init__(self):
        # Set Tesseract path for Windows (adjust if needed)
        # Common installation paths
        possible_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(os.environ.get('USERNAME', '')),
        ]
        
        # Try to find Tesseract
        self.tesseract_available = False
        for path in possible_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                self.tesseract_available = True
                print(f"Tesseract found at: {path}")
                break
        
        if not self.tesseract_available:
            print("WARNING: Tesseract OCR not found. OCR features will be disabled.")
            print("To enable OCR, install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki")
    
    def process_file(self, file_bytes: bytes, filename: str, file_type: str) -> Dict:
        """Process uploaded file and extract text"""
        
        try:
            # Generate file hash for duplicate detection
            file_hash = self._generate_hash(file_bytes)
            
            # Extract text based on file type
            if file_type == 'application/pdf':
                text = self._extract_from_pdf(file_bytes)
            elif file_type in ['image/jpeg', 'image/png']:
                text = self._extract_from_image(file_bytes)
            elif file_type == 'text/plain':
                text = self._extract_from_text(file_bytes)
            else:
                return {
                    "success": False,
                    "error": "Unsupported file type"
                }
            
            if not text or len(text.strip()) < 10:
                return {
                    "success": False,
                    "error": "No text could be extracted from the file"
                }
            
            return {
                "success": True,
                "text": text,
                "file_hash": file_hash,
                "char_count": len(text),
                "word_count": len(text.split())
            }
        
        except Exception as e:
            print(f"File processing error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF"""
        text = ""
        
        try:
            # Open PDF from bytes
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            
            # Extract text from all pages
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text()
            
            pdf_document.close()
            
            # If no text extracted, try OCR
            if len(text.strip()) < 50:
                print("PDF has little text, attempting OCR...")
                text = self._ocr_pdf(file_bytes)
            
            return text.strip()
        
        except Exception as e:
            print(f"PDF extraction error: {e}")
            # Try OCR as fallback
            try:
                return self._ocr_pdf(file_bytes)
            except:
                raise e
    
    def _ocr_pdf(self, file_bytes: bytes) -> str:
        """OCR for scanned PDFs"""
        if not self.tesseract_available:
            raise Exception("Tesseract OCR is not installed. Please install it to process scanned PDFs.")
        
        text = ""
        
        try:
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                
                # Render page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
                img_bytes = pix.tobytes("png")
                
                # OCR the image
                image = Image.open(io.BytesIO(img_bytes))
                page_text = pytesseract.image_to_string(image)
                text += page_text + "\n"
            
            pdf_document.close()
            return text.strip()
        
        except Exception as e:
            print(f"PDF OCR error: {e}")
            raise e
    
    def _extract_from_image(self, file_bytes: bytes) -> str:
        """Extract text from image using OCR"""
        if not self.tesseract_available:
            raise Exception("Tesseract OCR is not installed. Please install it to process images.")
        
        try:
            image = Image.open(io.BytesIO(file_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Perform OCR
            text = pytesseract.image_to_string(image)
            
            return text.strip()
        
        except Exception as e:
            print(f"Image OCR error: {e}")
            raise e
    
    def _extract_from_text(self, file_bytes: bytes) -> str:
        """Extract text from text file"""
        try:
            # Try UTF-8 first
            try:
                text = file_bytes.decode('utf-8')
            except UnicodeDecodeError:
                # Fallback to latin-1
                text = file_bytes.decode('latin-1')
            
            return text.strip()
        
        except Exception as e:
            print(f"Text extraction error: {e}")
            raise e
    
    def _generate_hash(self, file_bytes: bytes) -> str:
        """Generate SHA-256 hash of file"""
        return hashlib.sha256(file_bytes).hexdigest()


# Test function
def test_processor():
    """Test file processor"""
    processor = FileProcessor()
    
    # Test with sample text
    test_text = b"This is a test notice about AKTU exams."
    result = processor.process_file(test_text, "test.txt", "text/plain")
    
    print("Processing Result:")
    print(result)

if __name__ == "__main__":
    test_processor()
