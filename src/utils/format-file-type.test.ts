import { describe, expect, it } from 'vitest';
import { formatFileType } from '@/utils/format-file-type';

describe('formatFileType', () => {
	it('prefers file extension over MIME', () => {
		expect(formatFileType('application/octet-stream', 'guide.docx')).toBe('DOCX');
		expect(formatFileType(undefined, 'notes.TXT')).toBe('TXT');
	});

	it('maps known MIME types when extension is missing', () => {
		expect(formatFileType('application/pdf')).toBe('PDF');
		expect(formatFileType('text/plain')).toBe('TXT');
	});

	it('falls back to FILE for unknown types', () => {
		expect(formatFileType('application/x-unknown')).toBe('FILE');
		expect(formatFileType(undefined)).toBe('FILE');
	});
});
