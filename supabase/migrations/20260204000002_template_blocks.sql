-- Adding template_blocks and updating templates table
-- Migration: 002_template_blocks

-- Add description and preview_image columns to templates
ALTER TABLE templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS preview_image TEXT;

-- ============================================
-- TEMPLATE BLOCKS (Direct blocks on templates)
-- ============================================
CREATE TABLE IF NOT EXISTS template_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    block_order INT DEFAULT 0,
    default_content JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_template_blocks_template ON template_blocks(template_id);
