import { describe, expect, it } from 'vitest';
import { cleanDocument } from '@/lib/documents/clean-text';

describe('cleanDocument', () => {
	it('joins hyphenated line breaks from PDF extraction', () => {
		const { text } = cleanDocument('informa-\ntion about onboarding');
		expect(text).toBe('information about onboarding');
	});

	it('drops page-number and separator boilerplate lines', () => {
		const { text } = cleanDocument('Hello\n-- 12 --\nWorld\n====\nDone');
		expect(text).toContain('Hello');
		expect(text).toContain('World');
		expect(text).toContain('Done');
		expect(text).not.toMatch(/-- 12 --/);
		expect(text).not.toContain('====');
	});

	it('returns empty string for empty or whitespace-only input', () => {
		expect(cleanDocument('').text).toBe('');
		expect(cleanDocument('   \n\n  ').text).toBe('');
	});
});
