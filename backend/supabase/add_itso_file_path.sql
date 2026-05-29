-- Add separate ITSO file path column to documents table.
-- Nullable so existing rows are unaffected.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS itso_file_path TEXT NULL;
