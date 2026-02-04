export { getCloudflareClient, CloudflareClient } from './client';
export type * from './types';
export { setupDnsCname, removeDnsCname, checkDnsStatus } from './dns';

// Singleton instance
import { getCloudflareClient } from './client';
export const cloudflareClient = getCloudflareClient();
