import { NextRequest, NextResponse } from 'next/server';

// Proxy images from local API server
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  try {
    // Get the local API URL from environment or use localhost
    const localApiUrl = process.env.LOCAL_API_URL || 'http://localhost:8000';
    
    // Fetch image from local API
    const response = await fetch(`${localApiUrl}/generated_images/${filename}`);
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Determine content type
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
    
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}