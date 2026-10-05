/** Max upload size for local demo ingest (10 MiB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_UPLOAD_EXTENSIONS = ['pdf', 'docx', 'txt'] as const;

export type AllowedUploadExtension = (typeof ALLOWED_UPLOAD_EXTENSIONS)[number];

export const fileExtension = (fileName: string): string => {
	const parts = fileName.split('.');
	const extension = parts.length > 1 ? parts.pop() : undefined;
	return extension ? extension.toLowerCase() : '';
};

export const isAllowedUploadExtension = (extension: string): extension is AllowedUploadExtension => (ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(extension);

/**
 * Validate size and extension before any Storage or OpenAI work.
 * Throws Error with a client-safe message (maps to HTTP 400).
 */
export const assertUploadAllowed = (file: { name: string; size: number }): void => {
	if (file.size <= 0) {
		throw new Error('File is empty');
	}

	if (file.size > MAX_UPLOAD_BYTES) {
		throw new Error(`File is too large. Maximum size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`);
	}

	const extension = fileExtension(file.name);
	if (!isAllowedUploadExtension(extension)) {
		throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
	}
};
