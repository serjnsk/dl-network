-- DL-Network Database Schema
-- Migration: 001_initial_schema

-- ============================================
-- DOMAINS (Pre-registered domains pool)
-- ============================================
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name TEXT UNIQUE NOT NULL,
    cf_zone_id TEXT,
    dns_status TEXT DEFAULT 'pending' CHECK (dns_status IN ('pending', 'active', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DESIGN FILES (CSS via Stitch import)
-- ============================================
CREATE TABLE design_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    css_url TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEMPLATES
-- ============================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    design_file_id UUID REFERENCES design_files(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEMPLATE PAGES
-- ============================================
CREATE TABLE template_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    page_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(template_id, slug)
);

-- ============================================
-- PAGE BLOCKS (Block instances on pages)
-- ============================================
CREATE TABLE page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_page_id UUID NOT NULL REFERENCES template_pages(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    block_order INT DEFAULT 0,
    default_content JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS (Individual sites)
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    cf_project_id TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'published', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT DOMAINS (Many-to-many with config)
-- ============================================
CREATE TABLE project_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    is_primary BOOLEAN DEFAULT false,
    canonical_domain TEXT,
    tracking_config JSONB DEFAULT '{}',
    cf_deployment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, domain_id)
);

-- ============================================
-- PROJECT CONTENT (User content for blocks)
-- ============================================
CREATE TABLE project_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    page_slug TEXT NOT NULL,
    block_type TEXT NOT NULL,
    block_order INT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, page_slug, block_order)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_template ON projects(template_id);
CREATE INDEX idx_project_domains_project ON project_domains(project_id);
CREATE INDEX idx_project_content_project ON project_content(project_id);
CREATE INDEX idx_template_pages_template ON template_pages(template_id);
CREATE INDEX idx_page_blocks_page ON page_blocks(template_page_id);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_files_updated_at BEFORE UPDATE ON design_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_content_updated_at BEFORE UPDATE ON project_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
