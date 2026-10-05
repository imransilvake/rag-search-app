/**
 * CLEAN phase — normalize extracted text before chunk → embed.
 * Deterministic, no LLM. Multi-page header/footer removal needs per-page
 * extract (not available yet); keep helpers ready for that later.
 */

export interface CleanOptions {
	/** Redact emails/phones/SSN-like patterns. Off by default (irreversible). */
	scrubPii?: boolean;
}

export interface CleanResult {
	text: string;
}

/** Unicode normalize, fix PDF hyphen breaks, collapse whitespace, drop controls. */
export function normalizeText(text: string): string {
	let out = text.normalize('NFKC');

	// "informa-\ntion" → "information" (common PDF extraction artifact)
	out = out.replace(/(\w)-\n(\w)/g, '$1$2');

	out = out.replace(/[ \t]+/g, ' ');
	out = out.replace(/\n{3,}/g, '\n\n');

	// Strip control chars; keep \n and \t
	out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

	return out.trim();
}

/**
 * Drop separator / page-number-only lines.
 * Avoids aggressive "length < 3" filters that remove real short tokens.
 */
export function stripBoilerplate(text: string): string {
	const lines = text.split('\n');
	const cleaned: string[] = [];

	for (const line of lines) {
		const stripped = line.trim();

		if (stripped === '') {
			cleaned.push(line);
			continue;
		}

		// "-- 12 --", "====", "***", bare digits
		if (/^[\d\s\-–—_=*]{1,12}$/.test(stripped)) continue;

		cleaned.push(line);
	}

	return cleaned.join('\n');
}

/** Basic regex PII placeholders (optional). */
export function scrubPII(text: string): string {
	let out = text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]');
	out = out.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE]');
	out = out.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
	return out;
}

/** Run clean on a single extracted text blob. */
export function cleanDocument(rawText: string, opts: CleanOptions = {}): CleanResult {
	let text = normalizeText(rawText);
	text = stripBoilerplate(text);

	if (opts.scrubPii) {
		text = scrubPII(text);
	}

	// Collapse blank lines again after boilerplate removals
	text = text.replace(/\n{3,}/g, '\n\n').trim();

	return { text };
}
