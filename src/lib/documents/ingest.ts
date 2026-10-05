import { assertUploadAllowed, fileExtension } from '@/lib/documents/ingest-guards';
import { cleanDocument } from '@/lib/documents/clean-text';
import { chunkText } from '@/lib/documents/chunk-text';
import { embedTexts } from '@/lib/documents/embed';
import { extractTextFromFile } from '@/lib/documents/extract-text';
import { cleanupFailedIngest, insertChunk, insertLibraryFile, uploadFileToStorage } from '@/lib/documents/repository';
import { summarizeText } from '@/lib/documents/summarize-text';
import type { DocumentMetadata, IngestResult } from '@/lib/documents/types';

/**
 * Full ingest pipeline for one uploaded file.
 * Validates size/type first; Storage + DB run only after extract/chunk/embed succeed;
 * failures after that roll back uploaded bytes, chunks, and the library file row.
 */
export const ingestUploadedFile = async (file: File): Promise<IngestResult> => {
	assertUploadAllowed(file);

	const documentId = crypto.randomUUID();
	const uploadDate = new Date().toISOString();
	const extension = fileExtension(file.name);
	const filePath = `${documentId}.${extension}`;
	const fileBuffer = Buffer.from(await file.arrayBuffer());

	const rawText = await extractTextFromFile(file);
	const { text } = cleanDocument(rawText);
	if (!text.trim()) {
		throw new Error('Could not extract text from file');
	}

	const summary = await summarizeText(text);
	const chunks = await chunkText(text);
	const embeddings = await embedTexts(chunks);

	let didWriteSideEffects = false;
	try {
		const { publicUrl } = await uploadFileToStorage(filePath, fileBuffer, file.type || 'application/octet-stream');
		didWriteSideEffects = true;

		for (let index = 0; index < chunks.length; index++) {
			const content = chunks[index];
			const embedding = embeddings[index];

			const metadata: DocumentMetadata = {
				source: file.name,
				document_id: documentId,
				file_name: file.name,
				file_type: file.type || extension,
				file_size: file.size,
				upload_date: uploadDate,
				chunk_index: index,
				total_chunks: chunks.length,
				file_path: filePath,
				file_url: publicUrl,
				summary
			};

			await insertChunk({ content, metadata, embedding });
		}

		await insertLibraryFile({
			id: documentId,
			file_name: file.name,
			file_type: file.type || extension,
			file_size: file.size,
			file_path: filePath,
			file_url: publicUrl,
			summary,
			total_chunks: chunks.length,
			upload_date: uploadDate
		});

		return {
			documentId,
			fileName: file.name,
			chunks: chunks.length,
			textLength: text.length,
			fileUrl: publicUrl,
			summary
		};
	} catch (error) {
		if (didWriteSideEffects) {
			await cleanupFailedIngest({ documentId, filePath }).catch(() => undefined);
		}
		throw error;
	}
};
