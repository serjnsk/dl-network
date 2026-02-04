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

        // 2. Check if any record (A, AAAA, CNAME) already exists for this name
        const existingRecords = await client.listDnsRecords(zone.id);
        const existingRecord = existingRecords.find(
            (r) => (r.type === 'CNAME' || r.type === 'A' || r.type === 'AAAA') && r.name === domainName
        );

        if (existingRecord) {
            // If it's already a correct CNAME, we're done
            if (existingRecord.type === 'CNAME' && existingRecord.content === cfPagesUrl) {
                return {
                    success: true,
                    recordId: existingRecord.id,
                    zoneId: zone.id,
                };
            }

            // Delete existing record (A/AAAA/wrong CNAME) and create new CNAME
            try {
                await client.deleteDnsRecord(zone.id, existingRecord.id);
            } catch {
                // If delete fails, try to proceed anyway - the record might have been removed
            }

            try {
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
            } catch {
                // If creation fails because record still exists, consider it success
                return {
                    success: true,
                    recordId: existingRecord.id,
                    zoneId: zone.id,
                };
            }
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
        // If error is about existing record, consider it a success
        const errorMsg = error instanceof Error ? error.message : '';
        if (errorMsg.includes('already exists')) {
            return { success: true };
        }
        return {
            success: false,
            error: errorMsg || 'Unknown DNS error',
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
