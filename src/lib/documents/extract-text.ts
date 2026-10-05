const safeDecodeURIComponent = (value: string): string => {
	try {
		return decodeURIComponent(value);
	} catch {
		try {
			return decodeURIComponent(value.replace(/%/g, '%25'));
		} catch {
			return value;
		}
	}
};

const extractPdfText = async (buffer: Buffer): Promise<string> => {
	const PDFParser = (await import('pdf2json')).default;

	return new Promise((resolve, reject) => {
		// pdf2json has loose typings; keep the cast local to this adapter.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const pdfParser = new (PDFParser as any)(null, true);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		pdfParser.on('pdfParser_dataError', (err: any) => {
			reject(new Error(`PDF parsing error: ${err?.parserError ?? String(err)}`));
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
			try {
				let fullText = '';
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				pdfData.Pages?.forEach((page: any) => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					page.Texts?.forEach((text: any) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						text.R?.forEach((r: any) => {
							if (r.T) fullText += `${safeDecodeURIComponent(r.T)} `;
						});
					});
				});
				resolve(fullText.trim());
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				reject(new Error(`Error extracting text: ${message}`));
			}
		});

		pdfParser.parseBuffer(buffer);
	});
};

/**
 * Extract plain text from an uploaded PDF, DOCX, or TXT file.
 * Scanned image-only PDFs will return empty text (no OCR in this app).
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
	const buffer = Buffer.from(await file.arrayBuffer());
	const name = file.name.toLowerCase();

	if (name.endsWith('.pdf')) {
		return extractPdfText(buffer);
	}

	if (name.endsWith('.docx')) {
		const mammoth = await import('mammoth');
		const result = await mammoth.extractRawText({ buffer });
		return result.value;
	}

	if (name.endsWith('.txt')) {
		return buffer.toString('utf-8');
	}

	throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
};
