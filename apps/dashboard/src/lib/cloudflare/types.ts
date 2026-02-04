// Cloudflare API Types

export interface CloudflareApiResponse<T> {
    success: boolean;
    errors: Array<{ code: number; message: string }>;
    messages: Array<{ code: number; message: string }>;
    result: T;
}

export interface CloudflarePagesProject {
    id: string;
    name: string;
    subdomain: string;
    domains: string[];
    production_branch: string;
    created_on: string;
    source?: {
        type: 'github' | 'gitlab';
        config: {
            owner: string;
            repo_name: string;
            production_branch: string;
        };
    };
    build_config?: {
        build_command: string;
        destination_dir: string;
        root_dir?: string;
    };
    deployment_configs: {
        preview: DeploymentConfig;
        production: DeploymentConfig;
    };
    latest_deployment?: CloudflareDeployment;
}

export interface DeploymentConfig {
    env_vars?: Record<string, { value: string; type?: 'plain_text' | 'secret_text' }>;
    compatibility_date?: string;
}

export interface CloudflareDeployment {
    id: string;
    short_id: string;
    project_id: string;
    project_name: string;
    environment: 'production' | 'preview';
    url: string;
    created_on: string;
    modified_on: string;
    latest_stage: {
        name: string;
        status: 'idle' | 'active' | 'canceled' | 'success' | 'failure';
        started_on: string | null;
        ended_on: string | null;
    };
    deployment_trigger: {
        type: 'ad_hoc';
        metadata: {
            branch: string;
            commit_hash: string;
            commit_message: string;
        };
    };
    stages: Array<{
        name: string;
        status: 'idle' | 'active' | 'canceled' | 'success' | 'failure';
        started_on: string | null;
        ended_on: string | null;
    }>;
    aliases: string[];
}

export interface CreatePagesProjectInput {
    name: string;
    production_branch?: string;
    build_config?: {
        build_command: string;
        destination_dir: string;
        root_dir?: string;
    };
}

export interface CloudflareZone {
    id: string;
    name: string;
    status: string;
    type: string;
    created_on: string;
}

export interface CloudflareDnsRecord {
    id: string;
    zone_id: string;
    zone_name: string;
    name: string;
    type: string;
    content: string;
    proxied: boolean;
    ttl: number;
    created_on: string;
    modified_on: string;
}
