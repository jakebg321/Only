/**
 * Local Embeddings API Endpoint
 * Generates embeddings using Transformers.js (no external dependencies)
 */

import { NextRequest, NextResponse } from 'next/server';
import { embeddingsService } from '@/lib/embeddings-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('[EMBEDDINGS-API] 📥 Received request for embeddings');

    // Generate embeddings using local service
    const embeddings = await embeddingsService.generateEmbeddings(text);

    return NextResponse.json({
      embeddings,
      dimensions: embeddings[0]?.length || 0,
      count: embeddings.length
    });

  } catch (error) {
    console.error('[EMBEDDINGS-API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    model: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    description: 'Local embeddings service using Transformers.js'
  });
}