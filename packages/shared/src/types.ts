// ===========================================
// Database Entity Types
// ===========================================

export type ProjectStatus = 'draft' | 'building' | 'published' | 'failed';
export type DnsStatus = 'pending' | 'active' | 'error';

export interface Domain {
    id: string;
    domain_name: string;
    cf_zone_id: string | null;
    dns_status: DnsStatus;
    created_at: string;
    updated_at: string;
}

export interface DesignFile {
    id: string;
    name: string;
    css_url: string;
    variables: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Template {
    id: string;
    name: string;
    slug: string;
    design_file_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TemplatePage {
    id: string;
    template_id: string;
    slug: string;
    title: string;
    page_order: number;
    created_at: string;
}

export interface PageBlock {
    id: string;
    template_page_id: string;
    block_type: BlockType;
    block_order: number;
    default_content: Record<string, unknown>;
    created_at: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    template_id: string | null;
    cf_project_id: string | null;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;
}

export interface ProjectDomain {
    id: string;
    project_id: string;
    domain_id: string;
    is_primary: boolean;
    canonical_domain: string | null;
    tracking_config: TrackingConfig;
    cf_deployment_url: string | null;
    created_at: string;
}

export interface ProjectContent {
    id: string;
    project_id: string;
    page_slug: string;
    block_type: BlockType;
    block_order: number;
    content: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

// ===========================================
// Block Types
// ===========================================

export type BlockType = 'hero' | 'features' | 'cta' | 'testimonials' | 'footer';

export interface HeroContent {
    title: string;
    subtitle: string;
    button_text: string;
    button_url: string;
    background_image?: string;
}

export interface FeaturesContent {
    title: string;
    items: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

export interface CTAContent {
    title: string;
    description: string;
    button_text: string;
    button_url: string;
}

export interface TestimonialsContent {
    title: string;
    items: Array<{
        author: string;
        role: string;
        content: string;
        avatar?: string;
    }>;
}

export interface FooterContent {
    copyright: string;
    links: Array<{
        text: string;
        url: string;
    }>;
}

// ===========================================
// Tracking Configuration
// ===========================================

export interface TrackingConfig {
    ga_id?: string;
    ym_id?: string;
    fb_pixel?: string;
    custom_scripts?: string;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
}
