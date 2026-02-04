import { getCloudflareClient } from './client';

export interface DnsSetupResult {
    success: boolean;
    error?: string;
    recordId?: string;
    zoneId?: string;
}

/**
 * Setup DNS CNAME record for a custom domain pointing to Cloudflare Pages
 * @param domainName - Full domain name (e.g., "www.example.com" or "example.com")
 * @param cfPagesUrl - Cloudflare Pages URL (e.g., "project-name.pages.dev")
 */
export async function setupDnsCname(
    domainName: string,
    cfPagesUrl: string
): Promise<DnsSetupResult> {
    const client = getCloudflareClient();

    try {
        // 1. Find the zone for this domain
        const zone = await client.findZoneByName(domainName);

        if (!zone) {
            return {
                success: false,
                error: `Зона для домена ${domainName} не найдена в Cloudflare. Добавьте домен в Cloudflare вручную.`,
            };
        }

        // 2. Check if CNAME already exists
        const existingRecords = await client.listDnsRecords(zone.id);
        const existingCname = existingRecords.find(
            (r) => r.type === 'CNAME' && r.name === domainName
        );

        if (existingCname) {
            // Update if content is different
            if (existingCname.content !== cfPagesUrl) {
                await client.deleteDnsRecord(zone.id, existingCname.id);
                const newRecord = await client.createDnsRecord(zone.id, {
                    type: 'CNAME',
                    name: domainName,
                    content: cfPagesUrl,
                    proxied: true,
                });
                return {
                    success: true,
                    recordId: newRecord.id,
                    zoneId: zone.id,
                };
            }
            // Already exists with correct target
            return {
                success: true,
                recordId: existingCname.id,
                zoneId: zone.id,
            };
        }

        // 3. Create new CNAME record
        const record = await client.createDnsRecord(zone.id, {
            type: 'CNAME',
            name: domainName,
            content: cfPagesUrl,
            proxied: true, // Enable Cloudflare proxy for SSL
        });

        return {
            success: true,
            recordId: record.id,
            zoneId: zone.id,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown DNS error',
        };
    }
}

/**
 * Remove DNS CNAME record for a domain
 */
export async function removeDnsCname(
    domainName: string
): Promise<DnsSetupResult> {
    const client = getCloudflareClient();

    try {
        const zone = await client.findZoneByName(domainName);

        if (!zone) {
            return { success: true }; // No zone = nothing to delete
        }

        const records = await client.listDnsRecords(zone.id);
        const cname = records.find(
            (r) => r.type === 'CNAME' && r.name === domainName
        );

        if (cname) {
            await client.deleteDnsRecord(zone.id, cname.id);
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown DNS error',
        };
    }
}

/**
 * Check DNS status for a domain
 */
export async function checkDnsStatus(
    domainName: string,
    expectedTarget: string
): Promise<{ active: boolean; currentTarget?: string }> {
    const client = getCloudflareClient();

    try {
        const zone = await client.findZoneByName(domainName);

        if (!zone) {
            return { active: false };
        }

        const records = await client.listDnsRecords(zone.id);
        const cname = records.find(
            (r) => r.type === 'CNAME' && r.name === domainName
        );

        if (!cname) {
            return { active: false };
        }

        return {
            active: cname.content === expectedTarget,
            currentTarget: cname.content,
        };
    } catch {
        return { active: false };
    }
}
