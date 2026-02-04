export { getCloudflareClient, CloudflareClient } from './client';
export type * from './types';

// Singleton instance
import { getCloudflareClient } from './client';
export const cloudflareClient = getCloudflareClient();
