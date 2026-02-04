import type {
    CloudflareApiResponse,
    CloudflarePagesProject,
    CloudflareDeployment,
    CreatePagesProjectInput,
    CloudflareZone,
    CloudflareDnsRecord,
} from './types';

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

class CloudflareClient {
    private accountId: string;
    private apiToken: string;

    constructor() {
        this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;

        if (!this.accountId || !this.apiToken) {
            throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<CloudflareApiResponse<T>> {
        const url = `${CLOUDFLARE_API_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json() as CloudflareApiResponse<T>;

        if (!data.success) {
            const errorMessage = data.errors.map((e) => e.message).join(', ');
            throw new Error(`Cloudflare API Error: ${errorMessage}`);
        }

        return data;
    }

    // =====================
    // Pages Projects
    // =====================

    async listProjects(): Promise<CloudflarePagesProject[]> {
        const response = await this.request<CloudflarePagesProject[]>(
            `/accounts/${this.accountId}/pages/projects`
        );
        return response.result;
    }

    async getProject(projectName: string): Promise<CloudflarePagesProject> {
        const response = await this.request<CloudflarePagesProject>(
            `/accounts/${this.accountId}/pages/projects/${projectName}`
        );
        return response.result;
    }

    async createProject(input: CreatePagesProjectInput): Promise<CloudflarePagesProject> {
        const response = await this.request<CloudflarePagesProject>(
            `/accounts/${this.accountId}/pages/projects`,
            {
                method: 'POST',
                body: JSON.stringify({
                    name: input.name,
                    production_branch: input.production_branch || 'main',
                    build_config: input.build_config,
                }),
            }
        );
        return response.result;
    }

    async deleteProject(projectName: string): Promise<void> {
        await this.request(
            `/accounts/${this.accountId}/pages/projects/${projectName}`,
            { method: 'DELETE' }
        );
    }

    // =====================
    // Deployments
    // =====================

    async listDeployments(projectName: string): Promise<CloudflareDeployment[]> {
        const response = await this.request<CloudflareDeployment[]>(
            `/accounts/${this.accountId}/pages/projects/${projectName}/deployments`
        );
        return response.result;
    }

    async getDeployment(
        projectName: string,
        deploymentId: string
    ): Promise<CloudflareDeployment> {
        const response = await this.request<CloudflareDeployment>(
            `/accounts/${this.accountId}/pages/projects/${projectName}/deployments/${deploymentId}`
        );
        return response.result;
    }

    async createDeployment(
        projectName: string,
        files: Record<string, string> // path -> content
    ): Promise<CloudflareDeployment> {
        // For direct upload, we need to use FormData
        const manifest: Record<string, string> = {};
        const formData = new FormData();

        // Create file blobs and manifest
        for (const [path, content] of Object.entries(files)) {
            const hash = await this.hashContent(content);
            manifest[`/${path}`] = hash;
            formData.append(hash, new Blob([content]), path);
        }

        formData.append('manifest', JSON.stringify(manifest));

        const response = await fetch(
            `${CLOUDFLARE_API_URL}/accounts/${this.accountId}/pages/projects/${projectName}/deployments`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                },
                body: formData,
            }
        );

        const data = await response.json() as CloudflareApiResponse<CloudflareDeployment>;

        if (!data.success) {
            const errorMessage = data.errors.map((e) => e.message).join(', ');
            throw new Error(`Cloudflare Deployment Error: ${errorMessage}`);
        }

        return data.result;
    }

    async retryDeployment(
        projectName: string,
        deploymentId: string
    ): Promise<CloudflareDeployment> {
        const response = await this.request<CloudflareDeployment>(
            `/accounts/${this.accountId}/pages/projects/${projectName}/deployments/${deploymentId}/retry`,
            { method: 'POST' }
        );
        return response.result;
    }

    async rollbackDeployment(
        projectName: string,
        deploymentId: string
    ): Promise<CloudflareDeployment> {
        const response = await this.request<CloudflareDeployment>(
            `/accounts/${this.accountId}/pages/projects/${projectName}/deployments/${deploymentId}/rollback`,
            { method: 'POST' }
        );
        return response.result;
    }

    // =====================
    // Custom Domains
    // =====================

    async addCustomDomain(
        projectName: string,
        domain: string
    ): Promise<{ id: string; name: string; status: string }> {
        const response = await this.request<{ id: string; name: string; status: string }>(
            `/accounts/${this.accountId}/pages/projects/${projectName}/domains`,
            {
                method: 'POST',
                body: JSON.stringify({ name: domain }),
            }
        );
        return response.result;
    }

    async removeCustomDomain(projectName: string, domainName: string): Promise<void> {
        await this.request(
            `/accounts/${this.accountId}/pages/projects/${projectName}/domains/${domainName}`,
            { method: 'DELETE' }
        );
    }

    async listCustomDomains(
        projectName: string
    ): Promise<Array<{ id: string; name: string; status: string }>> {
        const response = await this.request<Array<{ id: string; name: string; status: string }>>(
            `/accounts/${this.accountId}/pages/projects/${projectName}/domains`
        );
        return response.result;
    }

    // =====================
    // Zones (DNS)
    // =====================

    async listZones(): Promise<CloudflareZone[]> {
        const response = await this.request<CloudflareZone[]>('/zones');
        return response.result;
    }

    async getZone(zoneId: string): Promise<CloudflareZone> {
        const response = await this.request<CloudflareZone>(`/zones/${zoneId}`);
        return response.result;
    }

    async findZoneByName(domainName: string): Promise<CloudflareZone | null> {
        // Extract root domain
        const parts = domainName.split('.');
        const rootDomain = parts.slice(-2).join('.');

        const response = await this.request<CloudflareZone[]>(
            `/zones?name=${rootDomain}`
        );
        return response.result[0] || null;
    }

    // =====================
    // DNS Records
    // =====================

    async listDnsRecords(zoneId: string): Promise<CloudflareDnsRecord[]> {
        const response = await this.request<CloudflareDnsRecord[]>(
            `/zones/${zoneId}/dns_records`
        );
        return response.result;
    }

    async createDnsRecord(
        zoneId: string,
        record: {
            type: 'CNAME' | 'A' | 'AAAA' | 'TXT';
            name: string;
            content: string;
            proxied?: boolean;
            ttl?: number;
        }
    ): Promise<CloudflareDnsRecord> {
        const response = await this.request<CloudflareDnsRecord>(
            `/zones/${zoneId}/dns_records`,
            {
                method: 'POST',
                body: JSON.stringify({
                    type: record.type,
                    name: record.name,
                    content: record.content,
                    proxied: record.proxied ?? true,
                    ttl: record.ttl ?? 1, // 1 = auto
                }),
            }
        );
        return response.result;
    }

    async deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
        await this.request(`/zones/${zoneId}/dns_records/${recordId}`, {
            method: 'DELETE',
        });
    }

    // =====================
    // Helpers
    // =====================

    private async hashContent(content: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
}

// Singleton instance
let cloudflareClient: CloudflareClient | null = null;

export function getCloudflareClient(): CloudflareClient {
    if (!cloudflareClient) {
        cloudflareClient = new CloudflareClient();
    }
    return cloudflareClient;
}

export { CloudflareClient };
