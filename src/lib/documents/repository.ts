import { DOCUMENTS_BUCKET, getSupabaseAnon, getSupabaseService } from '@/lib/supabase/client';
import type { DocumentDetail, DocumentMetadata, DocumentSummary, MatchedChunk } from '@/lib/documents/types';

export async function uploadFileToStorage(filePath: string, fileBuffer: Buffer, contentType: string): Promise<{ publicUrl: string }> {
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
}

export async function insertChunk(params: { content: string; metadata: DocumentMetadata; embedding: number[] }): Promise<void> {
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
}

export async function matchDocuments(params: { queryEmbedding: number[]; matchThreshold?: number; matchCount?: number }): Promise<MatchedChunk[]> {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase.rpc('match_documents', {
		query_embedding: JSON.stringify(params.queryEmbedding),
		match_threshold: params.matchThreshold ?? 0,
		match_count: params.matchCount ?? 5
	});

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []) as MatchedChunk[];
}

function toSummary(metadata: DocumentMetadata): DocumentSummary {
	return {
		id: metadata.document_id,
		file_name: metadata.file_name || 'Unknown',
		file_type: metadata.file_type || 'unknown',
		file_size: metadata.file_size || 0,
		upload_date: metadata.upload_date || new Date().toISOString(),
		total_chunks: metadata.total_chunks || 0,
		file_url: metadata.file_url,
		file_path: metadata.file_path,
		summary: metadata.summary
	};
}

export async function listDocuments(): Promise<DocumentSummary[]> {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase.from('documents').select('metadata');

	if (error) {
		throw new Error(error.message);
	}

	const byId = new Map<string, DocumentSummary>();
	for (const row of data ?? []) {
		const metadata = row.metadata as DocumentMetadata | null;
		if (!metadata?.document_id || byId.has(metadata.document_id)) continue;
		byId.set(metadata.document_id, toSummary(metadata));
	}

	return Array.from(byId.values());
}

export async function getDocumentDetail(documentId: string): Promise<DocumentDetail> {
	const supabase = getSupabaseAnon();
	const { data: chunks, error } = await supabase.from('documents').select('content, metadata').eq('metadata->>document_id', documentId);

	if (error || !chunks?.length) {
		throw new Error(error?.message || 'Document not found');
	}

	// JSON metadata fields sort as text in Postgres — sort numerically in app code.
	const ordered = [...chunks].sort((left, right) => {
		const leftIndex = (left.metadata as DocumentMetadata | null)?.chunk_index ?? 0;
		const rightIndex = (right.metadata as DocumentMetadata | null)?.chunk_index ?? 0;
		return leftIndex - rightIndex;
	});

	const metadata = ordered[0].metadata as DocumentMetadata;
	return {
		...toSummary(metadata),
		id: documentId,
		total_chunks: ordered.length,
		fullText: ordered.map((chunk) => chunk.content as string).join('\n\n')
	};
}

/** Best-effort rollback after a failed ingest (Storage object and/or partial chunk rows). */
export async function cleanupFailedIngest(params: { documentId: string; filePath: string }): Promise<void> {
	const supabaseService = getSupabaseService();
	const supabaseAnon = getSupabaseAnon();

	await supabaseService.storage.from(DOCUMENTS_BUCKET).remove([params.filePath]);

	const { error } = await supabaseAnon.from('documents').delete().eq('metadata->>document_id', params.documentId);
	if (error) {
		throw new Error(error.message);
	}
}

export async function getDocumentMetadata(documentId: string): Promise<DocumentMetadata> {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase.from('documents').select('metadata').eq('metadata->>document_id', documentId).limit(1);

	if (error || !data?.length) {
		throw new Error(error?.message || 'Document not found');
	}

	return data[0].metadata as DocumentMetadata;
}

export async function downloadStoredFile(filePath: string): Promise<Blob> {
	const supabase = getSupabaseService();
	const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).download(filePath);

	if (error || !data) {
		throw new Error(error?.message || 'File not stored');
	}

	return data;
}

export async function deleteDocument(documentId: string): Promise<{ fileDeleted: boolean }> {
	const metadata = await getDocumentMetadata(documentId).catch(() => null);
	const filePath = metadata?.file_path;
	let fileDeleted = false;

	if (filePath) {
		const supabase = getSupabaseService();
		await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath]);
		fileDeleted = true;
	}

	const supabase = getSupabaseAnon();
	const { error } = await supabase.from('documents').delete().eq('metadata->>document_id', documentId);

	if (error) {
		throw new Error(error.message);
	}

	return { fileDeleted };
}
