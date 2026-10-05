/** Metadata stored on every chunk row for one uploaded file. */
export interface DocumentMetadata {
	source: string;
	document_id: string;
	file_name: string;
	file_type: string;
	file_size: number;
	upload_date: string;
	chunk_index: number;
	total_chunks: number;
	file_path: string;
	file_url: string;
	/** Short LLM overview of the whole file (same on every chunk). */
	summary?: string;
}

/** Aggregated document as shown in the Documents UI. */
export interface DocumentSummary {
	id: string;
	file_name: string;
	file_type: string;
	file_size: number;
	upload_date: string;
	total_chunks: number;
	file_url?: string;
	file_path?: string;
	summary?: string;
}

export interface DocumentDetail extends DocumentSummary {
	fullText: string;
}

export interface MatchedChunk {
	id: number;
	content: string;
	metadata: DocumentMetadata | null;
	similarity: number;
}

export interface IngestResult {
	documentId: string;
	fileName: string;
	chunks: number;
	textLength: number;
	fileUrl: string;
	summary: string;
}

export interface RagSearchResult {
	answer: string;
	sources: MatchedChunk[];
}
