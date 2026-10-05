import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/env';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/** Publishable key client — Postgres queries and RPC from server API routes. */
export const getSupabaseAnon = (): SupabaseClient => {
	if (!anonClient) {
		anonClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
	}
	return anonClient;
};

/**
 * Secret key client (service role) — Storage upload/delete and ingest rollback.
 * Server-only; never expose `SUPABASE_SECRET_KEY` to the browser.
 */
export const getSupabaseService = (): SupabaseClient => {
	if (!serviceClient) {
		serviceClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
	}
	return serviceClient;
};

export const DOCUMENTS_BUCKET = 'documents';
