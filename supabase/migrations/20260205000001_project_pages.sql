-- Migration: Simplify to Static HTML Upload
-- Add project_pages table and global code fields

-- ============================================
-- ADD GLOBAL CODE FIELDS TO PROJECTS
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS global_head_code TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS global_body_code TEXT DEFAULT '';

-- ============================================
-- PROJECT PAGES (Static HTML pages)
-- ============================================
CREATE TABLE IF NOT EXISTS project_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    slug TEXT NOT NULL DEFAULT 'index',
    title TEXT NOT NULL,
    html_content TEXT NOT NULL DEFAULT '',
    page_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, slug)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_pages_project ON project_pages(project_id);

-- Trigger for updated_at
CREATE TRIGGER update_project_pages_updated_at BEFORE UPDATE ON project_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
