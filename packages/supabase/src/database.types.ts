// Auto-generated types placeholder
// Run `supabase gen types typescript` to generate actual types

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            domains: {
                Row: {
                    id: string;
                    domain_name: string;
                    cf_zone_id: string | null;
                    dns_status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    domain_name: string;
                    cf_zone_id?: string | null;
                    dns_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    domain_name?: string;
                    cf_zone_id?: string | null;
                    dns_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            design_files: {
                Row: {
                    id: string;
                    name: string;
                    css_url: string;
                    variables: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    css_url: string;
                    variables?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    css_url?: string;
                    variables?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            templates: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    design_file_id: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    design_file_id?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    design_file_id?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            projects: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    template_id: string | null;
                    cf_project_id: string | null;
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    template_id?: string | null;
                    cf_project_id?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    template_id?: string | null;
                    cf_project_id?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            project_domains: {
                Row: {
                    id: string;
                    project_id: string;
                    domain_id: string;
                    is_primary: boolean;
                    canonical_domain: string | null;
                    tracking_config: Json;
                    cf_deployment_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    domain_id: string;
                    is_primary?: boolean;
                    canonical_domain?: string | null;
                    tracking_config?: Json;
                    cf_deployment_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    domain_id?: string;
                    is_primary?: boolean;
                    canonical_domain?: string | null;
                    tracking_config?: Json;
                    cf_deployment_url?: string | null;
                    created_at?: string;
                };
            };
            project_content: {
                Row: {
                    id: string;
                    project_id: string;
                    page_slug: string;
                    block_type: string;
                    block_order: number;
                    content: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    page_slug: string;
                    block_type: string;
                    block_order: number;
                    content: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    page_slug?: string;
                    block_type?: string;
                    block_order?: number;
                    content?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            template_pages: {
                Row: {
                    id: string;
                    template_id: string;
                    slug: string;
                    title: string;
                    page_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    template_id: string;
                    slug: string;
                    title: string;
                    page_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    template_id?: string;
                    slug?: string;
                    title?: string;
                    page_order?: number;
                    created_at?: string;
                };
            };
            page_blocks: {
                Row: {
                    id: string;
                    template_page_id: string;
                    block_type: string;
                    block_order: number;
                    default_content: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    template_page_id: string;
                    block_type: string;
                    block_order?: number;
                    default_content?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    template_page_id?: string;
                    block_type?: string;
                    block_order?: number;
                    default_content?: Json;
                    created_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}
