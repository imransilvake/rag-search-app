-- Fix vector search returning zero rows on small corpora.
-- Cause: IVFFlat with lists=100 on a handful of chunks.
-- Run once in the Supabase SQL Editor if you already applied the old schema.

DROP INDEX IF EXISTS documents_embedding_ivfflat_idx;

CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx
  ON documents
  USING hnsw (embedding vector_cosine_ops);

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
