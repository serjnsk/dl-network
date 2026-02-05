-- Add is_active field to project_domains
-- When false, the domain is not added to Cloudflare Pages during deployment

ALTER TABLE project_domains
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment explaining the purpose
COMMENT ON COLUMN project_domains.is_active IS 'When false, domain is not added to CF Pages (for dev protection from search engines)';
