import { embedText } from '@/lib/documents/embed';
import { matchDocuments } from '@/lib/documents/repository';
import type { MatchedChunk } from '@/lib/documents/types';

export type RetrieveOptions = {
	matchThreshold?: number;
	matchCount?: number;
};

/**
 * Embed a query and return the top similar document chunks.
 * Shared by in-app tool calling and the Cursor MCP server.
 */
export async function retrieveRelevantChunks(query: string, options: RetrieveOptions = {}): Promise<MatchedChunk[]> {
	const trimmed = query.trim();
	if (!trimmed) {
		throw new Error('Query is required');
	}

	const matchCount = Math.min(Math.max(options.matchCount ?? 5, 1), 10);
	const queryEmbedding = await embedText(trimmed);

	return matchDocuments({
		queryEmbedding,
		matchThreshold: options.matchThreshold ?? 0,
		matchCount
	});
}
