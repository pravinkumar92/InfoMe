"""PDF text extraction with OCR support"""
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os
from typing import Optional

class PDFParser:
    def __init__(self):
        # Configure Tesseract path if needed (Windows)
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        pass
    
    def extract_text(self, pdf_path: str) -> str:
        """Extract text from PDF, with OCR fallback for scanned PDFs"""
        try:
            # Try direct text extraction first
            text = self._extract_text_direct(pdf_path)
            
            # If very little text found, try OCR
            if len(text.strip()) < 100:
                print(f"  📄 PDF appears to be scanned, using OCR...")
                text = self._extract_text_ocr(pdf_path)
            
            return text.strip()
        
        except Exception as e:
            print(f"  ❌ PDF extraction failed: {str(e)}")
            return ""
    
    def _extract_text_direct(self, pdf_path: str) -> str:
        """Extract text directly from PDF"""
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text()
        
        doc.close()
        return text
    
    def _extract_text_ocr(self, pdf_path: str) -> str:
        """Extract text using OCR (for scanned PDFs)"""
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(min(5, len(doc))):  # Limit to first 5 pages
            page = doc[page_num]
            
            # Render page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            img = Image.open(io.BytesIO(img_data))
            
            # Run OCR
            page_text = pytesseract.image_to_string(img, lang='eng+hin')  # English + Hindi
            text += page_text + "\n"
        
        doc.close()
        return text
    
    def extract_metadata(self, pdf_path: str) -> dict:
        """Extract PDF metadata"""
        try:
            doc = fitz.open(pdf_path)
            metadata = doc.metadata
            doc.close()
            return metadata
        except:
            return {}


# Alternative: pdfplumber for tables
class PDFTableParser:
    """Extract tables from PDFs using pdfplumber"""
    
    def extract_tables(self, pdf_path: str) -> list:
        """Extract tables from PDF"""
        try:
            import pdfplumber
            
            tables = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
            
            return tables
        except Exception as e:
            print(f"  ❌ Table extraction failed: {str(e)}")
            return []
