import { describe, expect, it } from 'vitest';
import { assertUploadAllowed, MAX_UPLOAD_BYTES } from '@/lib/documents/ingest-guards';

describe('assertUploadAllowed', () => {
	it('accepts allowed extensions under the size limit', () => {
		expect(() => assertUploadAllowed({ name: 'notes.txt', size: 100 })).not.toThrow();
		expect(() => assertUploadAllowed({ name: 'guide.PDF', size: 1024 })).not.toThrow();
		expect(() => assertUploadAllowed({ name: 'policy.docx', size: MAX_UPLOAD_BYTES })).not.toThrow();
	});

	it('rejects empty files before any upload work', () => {
		expect(() => assertUploadAllowed({ name: 'empty.txt', size: 0 })).toThrow(/empty/i);
	});

	it('rejects files over the max size', () => {
		expect(() => assertUploadAllowed({ name: 'big.pdf', size: MAX_UPLOAD_BYTES + 1 })).toThrow(/too large/i);
	});

	it('rejects unsupported extensions', () => {
		expect(() => assertUploadAllowed({ name: 'photo.png', size: 100 })).toThrow(/Unsupported file type/i);
		expect(() => assertUploadAllowed({ name: 'archive', size: 100 })).toThrow(/Unsupported file type/i);
	});
});
