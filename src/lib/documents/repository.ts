import { DOCUMENTS_BUCKET, getSupabaseAnon, getSupabaseService } from '@/lib/supabase/client';
import type { DocumentDetail, DocumentMetadata, DocumentSummary, MatchedChunk } from '@/lib/documents/types';

type LibraryFileRow = {
	id: string;
	file_name: string;
	file_type: string;
	file_size: number;
	file_path: string;
	file_url: string;
	summary: string | null;
	total_chunks: number;
	upload_date: string;
};

const libraryFileToSummary = (row: LibraryFileRow): DocumentSummary => ({
	id: row.id,
	file_name: row.file_name || 'Unknown',
	file_type: row.file_type || 'unknown',
	file_size: Number(row.file_size) || 0,
	upload_date: row.upload_date || new Date().toISOString(),
	total_chunks: Number(row.total_chunks) || 0,
	file_url: row.file_url,
	file_path: row.file_path,
	summary: row.summary ?? undefined
});

const libraryFileToMetadata = (row: LibraryFileRow): DocumentMetadata => ({
	source: row.file_name,
	document_id: row.id,
	file_name: row.file_name,
	file_type: row.file_type,
	file_size: Number(row.file_size) || 0,
	upload_date: row.upload_date,
	chunk_index: 0,
	total_chunks: Number(row.total_chunks) || 0,
	file_path: row.file_path,
	file_url: row.file_url,
	summary: row.summary ?? undefined
});

export const uploadFileToStorage = async (filePath: string, fileBuffer: Buffer, contentType: string): Promise<{ publicUrl: string }> => {
	const supabase = getSupabaseService();
	const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(filePath, fileBuffer, {
		contentType,
		upsert: false
	});

	if (error) {
		const msg = error.message || 'Unknown storage error';
		if (msg.toLowerCase().includes('row-level security') || msg.includes('RLS')) {
			throw new Error(`Storage RLS error: ${msg}. Ensure SUPABASE_SECRET_KEY is set in .env.local.`);
		}
		throw new Error(`Failed to store file: ${msg}`);
	}

	const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(filePath);
	return { publicUrl: data.publicUrl };
};

export const insertChunk = async (params: { content: string; metadata: DocumentMetadata; embedding: number[] }): Promise<void> => {
	const supabase = getSupabaseAnon();
	const { error } = await supabase.from('documents').insert({
		content: params.content,
		metadata: params.metadata,
		embedding: JSON.stringify(params.embedding),
		file_path: params.metadata.file_path,
		file_url: params.metadata.file_url
	});

	if (error) {
		throw new Error(error.message);
	}
};

export const insertLibraryFile = async (row: LibraryFileRow): Promise<void> => {
	const supabase = getSupabaseAnon();
	const { error } = await supabase.from('library_files').insert({
		id: row.id,
		file_name: row.file_name,
		file_type: row.file_type,
		file_size: row.file_size,
		file_path: row.file_path,
		file_url: row.file_url,
		summary: row.summary,
		total_chunks: row.total_chunks,
		upload_date: row.upload_date
	});

	if (error) {
		throw new Error(error.message);
	}
};

export const matchDocuments = async (params: { queryEmbedding: number[]; matchThreshold?: number; matchCount?: number }): Promise<MatchedChunk[]> => {
	const matchThreshold = params.matchThreshold ?? 0;
	const matchCount = params.matchCount ?? 5;
	const supabase = getSupabaseAnon();

	// Prefer server RPC (uses vector index when healthy).
	const { data, error } = await supabase.rpc('match_documents', {
		query_embedding: params.queryEmbedding,
		match_threshold: matchThreshold,
		match_count: matchCount
	});

	if (!error && data?.length) {
		return data as MatchedChunk[];
	}

	// IVFFlat with lists >> row count returns zero rows; fall back to exact cosine in app.
	if (error) {
		console.error('match_documents RPC failed; using exact similarity fallback:', error.message);
	}

	return matchDocumentsExact({
		queryEmbedding: params.queryEmbedding,
		matchThreshold,
		matchCount
	});
};

const parseEmbedding = (value: unknown): number[] | null => {
	if (Array.isArray(value) && value.every((item) => typeof item === 'number')) {
		return value;
	}
	if (typeof value === 'string') {
		try {
			const parsed: unknown = JSON.parse(value);
			if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'number')) {
				return parsed;
			}
		} catch {
			return null;
		}
	}
	return null;
};

/** Cosine similarity for OpenAI embeddings (unit-normalized → same ranking as pgvector cosine ops). */
const cosineSimilarity = (left: number[], right: number[]): number => {
	const length = Math.min(left.length, right.length);
	let dot = 0;
	let leftNorm = 0;
	let rightNorm = 0;
	for (let index = 0; index < length; index++) {
		dot += left[index] * right[index];
		leftNorm += left[index] * left[index];
		rightNorm += right[index] * right[index];
	}
	const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
	return denominator === 0 ? 0 : dot / denominator;
};

const matchDocumentsExact = async (params: { queryEmbedding: number[]; matchThreshold: number; matchCount: number }): Promise<MatchedChunk[]> => {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase.from('documents').select('id, content, metadata, embedding');

	if (error) {
		throw new Error(error.message);
	}

	const ranked: MatchedChunk[] = [];
	for (const row of data ?? []) {
		const embedding = parseEmbedding(row.embedding);
		if (!embedding || embedding.length !== params.queryEmbedding.length) continue;

		const similarity = cosineSimilarity(params.queryEmbedding, embedding);
		if (similarity <= params.matchThreshold) continue;

		ranked.push({
			id: row.id as number,
			content: row.content as string,
			metadata: row.metadata as DocumentMetadata | null,
			similarity
		});
	}

	return ranked.sort((left, right) => right.similarity - left.similarity).slice(0, params.matchCount);
};

export const listDocuments = async (): Promise<DocumentSummary[]> => {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase
		.from('library_files')
		.select('id, file_name, file_type, file_size, file_path, file_url, summary, total_chunks, upload_date')
		.order('upload_date', { ascending: false });

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []).map((row) => libraryFileToSummary(row as LibraryFileRow));
};

export const getDocumentDetail = async (documentId: string): Promise<DocumentDetail> => {
	const supabase = getSupabaseAnon();
	const { data: fileRow, error: fileError } = await supabase
		.from('library_files')
		.select('id, file_name, file_type, file_size, file_path, file_url, summary, total_chunks, upload_date')
		.eq('id', documentId)
		.maybeSingle();

	if (fileError) {
		throw new Error(fileError.message);
	}

	if (!fileRow) {
		throw new Error('Document not found');
	}

	const { data: chunks, error: chunksError } = await supabase.from('documents').select('content, metadata').eq('metadata->>document_id', documentId);

	if (chunksError) {
		throw new Error(chunksError.message);
	}

	const ordered = [...(chunks ?? [])].sort((left, right) => {
		const leftIndex = (left.metadata as DocumentMetadata | null)?.chunk_index ?? 0;
		const rightIndex = (right.metadata as DocumentMetadata | null)?.chunk_index ?? 0;
		return leftIndex - rightIndex;
	});

	const summary = libraryFileToSummary(fileRow as LibraryFileRow);
	return {
		...summary,
		total_chunks: ordered.length || summary.total_chunks,
		fullText: ordered.map((chunk) => chunk.content as string).join('\n\n')
	};
};

/** Best-effort rollback after a failed ingest (Storage object, chunks, library file). */
export const cleanupFailedIngest = async (params: { documentId: string; filePath: string }): Promise<void> => {
	const supabaseService = getSupabaseService();
	const supabaseAnon = getSupabaseAnon();

	await supabaseService.storage.from(DOCUMENTS_BUCKET).remove([params.filePath]);

	const { error: chunksError } = await supabaseAnon.from('documents').delete().eq('metadata->>document_id', params.documentId);
	if (chunksError) {
		throw new Error(chunksError.message);
	}

	const { error: fileError } = await supabaseAnon.from('library_files').delete().eq('id', params.documentId);
	if (fileError) {
		throw new Error(fileError.message);
	}
};

export const getDocumentMetadata = async (documentId: string): Promise<DocumentMetadata> => {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase
		.from('library_files')
		.select('id, file_name, file_type, file_size, file_path, file_url, summary, total_chunks, upload_date')
		.eq('id', documentId)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		throw new Error('Document not found');
	}

	return libraryFileToMetadata(data as LibraryFileRow);
};

export const downloadStoredFile = async (filePath: string): Promise<Blob> => {
	const supabase = getSupabaseService();
	const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).download(filePath);

	if (error || !data) {
		throw new Error(error?.message || 'File not stored');
	}

	return data;
};

export const deleteDocument = async (documentId: string): Promise<{ fileDeleted: boolean }> => {
	const metadata = await getDocumentMetadata(documentId).catch(() => null);
	const filePath = metadata?.file_path;
	let fileDeleted = false;

	if (filePath) {
		const supabase = getSupabaseService();
		await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath]);
		fileDeleted = true;
	}

	const supabase = getSupabaseAnon();

	const { error: chunksError } = await supabase.from('documents').delete().eq('metadata->>document_id', documentId);
	if (chunksError) {
		throw new Error(chunksError.message);
	}

	const { error: fileError } = await supabase.from('library_files').delete().eq('id', documentId);
	if (fileError) {
		throw new Error(fileError.message);
	}

	return { fileDeleted };
};
