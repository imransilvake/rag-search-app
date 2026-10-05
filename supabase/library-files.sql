-- One row per uploaded file (library index). Chunks stay in `documents`.
-- Run once in the Supabase SQL Editor if your project already has schema.sql
-- from before library_files existed. Fresh installs: schema.sql includes this.

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

-- Backfill from existing chunk metadata (safe to re-run).
INSERT INTO library_files (id, file_name, file_type, file_size, file_path, file_url, summary, total_chunks, upload_date)
SELECT
  (metadata->>'document_id')::uuid AS id,
  COALESCE(MAX(metadata->>'file_name'), 'Unknown') AS file_name,
  COALESCE(MAX(metadata->>'file_type'), 'unknown') AS file_type,
  COALESCE(MAX((metadata->>'file_size')::bigint), 0) AS file_size,
  COALESCE(MAX(metadata->>'file_path'), MAX(file_path), '') AS file_path,
  COALESCE(MAX(metadata->>'file_url'), MAX(file_url), '') AS file_url,
  MAX(metadata->>'summary') AS summary,
  COUNT(*)::int AS total_chunks,
  COALESCE(MAX((metadata->>'upload_date')::timestamptz), now()) AS upload_date
FROM documents
WHERE metadata->>'document_id' IS NOT NULL
  AND (metadata->>'document_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY metadata->>'document_id'
ON CONFLICT (id) DO NOTHING;
