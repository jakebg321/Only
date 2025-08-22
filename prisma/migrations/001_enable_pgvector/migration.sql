-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to ChatSession (nullable for legacy rows)
ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS undertone TEXT;

-- Create HNSW index for cosine similarity search
-- Note: HNSW builds may take time on large datasets, using IVFFlat as interim if needed
CREATE INDEX IF NOT EXISTS chat_embedding_hnsw_idx ON "ChatSession" 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Add subscriber index for user-specific queries
CREATE INDEX IF NOT EXISTS "ChatSession_subscriberId_idx" ON "ChatSession"("subscriberId");

-- Set maintenance work memory for index building (if possible on Render)
-- This will be ignored if user doesn't have permission
SET maintenance_work_mem = '1GB';