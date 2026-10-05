/** Normalize extracted text before chunk → embed (deterministic, no LLM). */

/** Unicode normalize, fix PDF hyphen breaks, collapse whitespace, drop controls. */
const normalizeText = (text: string): string => {
	let out = text.normalize('NFKC');

	// "informa-\ntion" → "information" (common PDF extraction artifact)
	out = out.replace(/(\w)-\n(\w)/g, '$1$2');

	out = out.replace(/[ \t]+/g, ' ');
	out = out.replace(/\n{3,}/g, '\n\n');

	// Strip control chars; keep \n and \t
	out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

	return out.trim();
};

/**
 * Drop separator / page-number-only lines.
 * Avoids aggressive "length < 3" filters that remove real short tokens.
 */
const stripBoilerplate = (text: string): string => {
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
};

/** Run clean on a single extracted text blob. */
export const cleanDocument = (rawText: string): { text: string } => {
	let text = normalizeText(rawText);
	text = stripBoilerplate(text);

	// Collapse blank lines again after boilerplate removals
	text = text.replace(/\n{3,}/g, '\n\n').trim();

	return { text };
};
