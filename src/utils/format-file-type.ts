const MIME_SHORT_NAMES: Record<string, string> = {
	'application/pdf': 'PDF',
	'application/msword': 'DOC',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
	'application/vnd.ms-excel': 'XLS',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
	'application/vnd.ms-powerpoint': 'PPT',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
	'text/plain': 'TXT',
	'text/markdown': 'MD',
	'text/csv': 'CSV',
	'application/json': 'JSON',
	'application/rtf': 'RTF',
	'application/octet-stream': 'FILE'
};

const EXTENSION_SHORT_NAMES: Record<string, string> = {
	pdf: 'PDF',
	doc: 'DOC',
	docx: 'DOCX',
	xls: 'XLS',
	xlsx: 'XLSX',
	ppt: 'PPT',
	pptx: 'PPTX',
	txt: 'TXT',
	md: 'MD',
	markdown: 'MD',
	csv: 'CSV',
	json: 'JSON',
	rtf: 'RTF'
};

/** Short label for the Type column — e.g. DOCX instead of a long MIME string. */
export const formatFileType = (fileType: string | undefined, fileName?: string): string => {
	const extension = fileName?.includes('.') ? fileName.split('.').pop()?.toLowerCase() : undefined;
	if (extension && EXTENSION_SHORT_NAMES[extension]) {
		return EXTENSION_SHORT_NAMES[extension];
	}

	const mime = fileType?.toLowerCase().trim();
	if (mime && MIME_SHORT_NAMES[mime]) {
		return MIME_SHORT_NAMES[mime];
	}

	if (extension && /^[a-z0-9]{1,8}$/i.test(extension)) {
		return extension.toUpperCase();
	}

	if (mime && !mime.includes('/')) {
		return mime.toUpperCase();
	}

	return 'FILE';
};
