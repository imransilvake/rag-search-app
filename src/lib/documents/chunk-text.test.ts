import { describe, expect, it } from 'vitest';
import { chunkText } from '@/lib/documents/chunk-text';

describe('chunkText', () => {
	it('returns an empty array for empty input', async () => {
		await expect(chunkText('')).resolves.toEqual([]);
		await expect(chunkText('   ')).resolves.toEqual([]);
	});

	it('keeps a short document as a single chunk', async () => {
		const chunks = await chunkText('Short note about probation reviews.');
		expect(chunks.length).toBe(1);
		expect(chunks[0]).toContain('probation');
	});

	it('splits long text into overlapping chunks when size is small', async () => {
		const filler = Array.from({ length: 80 }, (_, index) => `Sentence number ${index} about workplace onboarding.`).join(' ');
		const chunks = await chunkText(filler, { chunkSize: 40, chunkOverlap: 8 });
		expect(chunks.length).toBeGreaterThan(1);
		expect(chunks.every((chunk) => chunk.trim().length > 0)).toBe(true);
	});
});
