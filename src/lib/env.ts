/**
 * Server-side env access.
 * Reads happen at call time so the app can start without keys;
 * API routes fail with a clear message when a required value is missing.
 */

function required(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.local and fill in your keys (see docs/SETUP.md).`);
	}
	return value;
}

function firstPresent(...names: string[]): string {
	for (const name of names) {
		const value = process.env[name]?.trim();
		if (value) return value;
	}
	throw new Error(`Missing environment variable (tried: ${names.join(', ')}). Copy .env.example to .env.local and fill in your keys (see docs/SETUP.md).`);
}

export function getSupabaseUrl(): string {
	return required('NEXT_PUBLIC_SUPABASE_URL');
}

/** Public client key — Supabase UI now labels this "publishable"; older docs say "anon". */
export function getSupabaseAnonKey(): string {
	return firstPresent('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/** Server secret key — `SUPABASE_SECRET_KEY` (preferred) or legacy `SUPABASE_SERVICE_ROLE_KEY`. */
export function getSupabaseServiceRoleKey(): string {
	return firstPresent('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY');
}

export function getOpenAIApiKey(): string {
	return required('OPENAI_API_KEY');
}
