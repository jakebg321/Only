/**
 * Local Embeddings Service
 * Uses Transformers.js to generate embeddings on Render (no external APIs)
 */

// Dynamic import to handle module errors gracefully
let pipeline: any;
let env: any;

try {
  const transformers = require('@xenova/transformers');
  pipeline = transformers.pipeline;
  env = transformers.env;
} catch (error) {
  console.warn('[EMBEDDINGS] ⚠️ Transformers.js not available, will use fallback embeddings');
}

// Configure Transformers.js for Node.js environment (if available)
if (env) {
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
}

export class EmbeddingsService {
  private static instance: EmbeddingsService;
  private extractor: any = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): EmbeddingsService {
    if (!EmbeddingsService.instance) {
      EmbeddingsService.instance = new EmbeddingsService();
    }
    return EmbeddingsService.instance;
  }

  /**
   * Initialize the model (lazy loading)
   */
  private async initialize(): Promise<void> {
    if (this.extractor) return;
    
    // Check if pipeline is available
    if (!pipeline) {
      console.log('[EMBEDDINGS] ⚠️ Using fallback embeddings (Transformers.js not available)');
      return;
    }
    
    if (this.isLoading) {
      // Wait for existing load to complete
      if (this.loadPromise) {
        await this.loadPromise;
        return;
      }
    }

    this.isLoading = true;
    console.log('[EMBEDDINGS] 🔄 Loading sentence-transformers model...');
    
    this.loadPromise = (async () => {
      try {
        // Load the same model that RunPod would use
        // This gives us 384-dimensional embeddings
        this.extractor = await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2',
          { quantized: true } // Use quantized model for faster loading and less memory
        );
        console.log('[EMBEDDINGS] ✅ Model loaded successfully');
      } catch (error) {
        console.error('[EMBEDDINGS] ❌ Model load failed, using fallback:', error);
        // Don't throw - will use fallback embeddings
        this.extractor = null;
      } finally {
        this.isLoading = false;
      }
    })();

    await this.loadPromise;
  }

  /**
   * Generate embeddings for text
   * @param text - Single text or array of texts
   * @returns Array of 384-dimensional embeddings
   */
  async generateEmbeddings(text: string | string[]): Promise<number[][]> {
    try {
      // Ensure model is loaded
      await this.initialize();

      const texts = Array.isArray(text) ? text : [text];
      const embeddings: number[][] = [];

      console.log(`[EMBEDDINGS] 🧮 Generating embeddings for ${texts.length} text(s)...`);

      for (const t of texts) {
        // Check if extractor is available
        if (!this.extractor) {
          // Use fallback if model not loaded
          const fallbackEmbedding = this.generateFallbackEmbedding(t);
          embeddings.push(fallbackEmbedding);
          continue;
        }
        
        // Generate embedding
        const output = await this.extractor(t, {
          pooling: 'mean',
          normalize: true
        });

        // Convert to regular array and ensure it's a number array
        const embedding = Array.from(output.data as Float32Array).map((v: any) => Number(v));
        embeddings.push(embedding);
      }

      console.log(`[EMBEDDINGS] ✅ Generated ${embeddings.length} embeddings (${embeddings[0]?.length || 0} dims)`);
      return embeddings;

    } catch (error) {
      console.error('[EMBEDDINGS] ❌ Generation failed:', error);
      
      // Return deterministic fallback embeddings
      const texts = Array.isArray(text) ? text : [text];
      return texts.map(t => this.generateFallbackEmbedding(t));
    }
  }

  /**
   * Compute cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Generate deterministic fallback embedding for a text
   */
  private generateFallbackEmbedding(text: string): number[] {
    const embedding = Array(384).fill(0).map((_, i) => {
      const hash = text.charCodeAt(i % text.length) / 255;
      return (Math.sin(hash * i) + Math.cos(hash * (i + 1))) / 2;
    });
    return embedding;
  }
}

// Export singleton instance
export const embeddingsService = EmbeddingsService.getInstance();