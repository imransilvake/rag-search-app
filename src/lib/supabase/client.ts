import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/env';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/** Public client — safe for reads that rely on anon key / RLS. */
export function getSupabaseAnon(): SupabaseClient {
	if (!anonClient) {
		anonClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
	}
	return anonClient;
}

/**
 * Service-role client — bypasses RLS.
 * Use only in server routes for Storage upload/download/delete.
 */
export function getSupabaseService(): SupabaseClient {
	if (!serviceClient) {
		serviceClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
	}
	return serviceClient;
}

export const DOCUMENTS_BUCKET = 'documents';
