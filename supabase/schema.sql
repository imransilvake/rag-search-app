-- RAG search schema for Supabase (PostgreSQL + pgvector)
-- Run this once in the Supabase SQL Editor.

-- Enable vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- One row per uploaded file (library index)
CREATE TABLE IF NOT EXISTS library_files (
  id UUID PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  summary TEXT,
  total_chunks INT NOT NULL DEFAULT 0,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS library_files_upload_date_idx
  ON library_files (upload_date DESC);

-- Document chunks + embeddings
-- One uploaded file becomes many rows (one per chunk).
-- File identity: metadata.document_id → library_files.id
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(1536), -- OpenAI text-embedding-3-small
  file_path TEXT NULL,
  file_url TEXT NULL
);

-- Speeds up cosine similarity queries (HNSW works for small and large corpora;
-- IVFFlat with lists=100 on tiny tables can return zero rows).
CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx
  ON documents
  USING hnsw (embedding vector_cosine_ops);

-- Find chunks most similar to a query embedding
-- match_threshold defaults to 0 in app code so small corpora still return hits.
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    (1 - (documents.embedding <=> query_embedding))::float AS similarity
  FROM documents
  WHERE documents.embedding IS NOT NULL
    AND 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Conversation history (Q&A threads)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON messages (conversation_id, created_at);
