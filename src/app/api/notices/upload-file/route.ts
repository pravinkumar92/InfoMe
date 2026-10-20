import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, PNG, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Send file directly to Python backend for processing
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    try {
      const processFormData = new FormData();
      processFormData.append('file', file);

      console.log('Sending to backend:', `${backendUrl}/notices/process-file`);

      const processResponse = await fetch(`${backendUrl}/notices/process-file`, {
        method: 'POST',
        body: processFormData
      });

      console.log('Backend response status:', processResponse.status);

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error('Backend error:', errorText);
        
        // Check if it's a Tesseract error
        if (errorText.includes('tesseract')) {
          return NextResponse.json({
            success: false,
            error: 'OCR Engine Not Installed',
            message: 'Tesseract OCR is required to process scanned PDFs and images. Please install it to continue.',
            details: 'Visit https://github.com/UB-Mannheim/tesseract/wiki to download and install Tesseract OCR for Windows.',
            installGuide: 'See TESSERACT_INSTALLATION.md in the project root for detailed instructions.',
            workaround: 'You can still upload text-based PDFs (with selectable text) without Tesseract.'
          }, { status: 400 });
        }
        
        throw new Error(`Backend processing failed: ${errorText}`);
      }

      const processedData = await processResponse.json();
      console.log('Backend processing successful');

      return NextResponse.json({
        success: true,
        ...processedData
      });
    } catch (backendError) {
      console.error('Backend processing error:', backendError);
      
      return NextResponse.json({
        success: false,
        error: 'Backend processing failed',
        message: backendError instanceof Error ? backendError.message : 'Unknown error',
        details: 'Make sure the Python backend is running on port 8000'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
