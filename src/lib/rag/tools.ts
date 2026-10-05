import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { listDocuments } from '@/lib/documents/repository';
import type { MatchedChunk } from '@/lib/documents/types';
import { retrieveRelevantChunks } from '@/lib/rag/retrieve';

export const RAG_TOOLS: ChatCompletionTool[] = [
	{
		type: 'function',
		function: {
			name: 'search_documents',
			description: "Semantically search uploaded documents. Use this to find facts, quotes, or passages before answering. Prefer a focused query over the user's full message.",
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'Focused search query for the document corpus'
					},
					match_count: {
						type: 'integer',
						description: 'Number of chunks to return (1–10). Default 5.',
						minimum: 1,
						maximum: 10
					}
				},
				required: ['query'],
				additionalProperties: false
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'list_documents',
			description: 'List uploaded documents with file names and short summaries. Use when the user asks what is available or which file to look in.',
			parameters: {
				type: 'object',
				properties: {},
				additionalProperties: false
			}
		}
	}
];

export type ToolExecutionResult = {
	payload: unknown;
	sources: MatchedChunk[];
};

const formatChunksForTool = (chunks: MatchedChunk[]) => {
	return chunks.map((chunk) => ({
		id: chunk.id,
		similarity: chunk.similarity,
		source: chunk.metadata?.source || chunk.metadata?.file_name || 'Unknown',
		file_name: chunk.metadata?.file_name,
		chunk_index: chunk.metadata?.chunk_index,
		content: chunk.content
	}));
};

/**
 * Run a named RAG tool and return JSON-serializable payload + any source chunks.
 */
export const executeRagTool = async (name: string, argsJson: string): Promise<ToolExecutionResult> => {
	let args: Record<string, unknown> = {};
	if (argsJson.trim()) {
		try {
			args = JSON.parse(argsJson) as Record<string, unknown>;
		} catch {
			throw new Error(`Invalid tool arguments for ${name}`);
		}
	}

	if (name === 'search_documents') {
		const query = typeof args.query === 'string' ? args.query : '';
		const matchCount = typeof args.match_count === 'number' ? args.match_count : undefined;
		const chunks = await retrieveRelevantChunks(query, { matchCount });
		return {
			payload: {
				count: chunks.length,
				chunks: formatChunksForTool(chunks)
			},
			sources: chunks
		};
	}

	if (name === 'list_documents') {
		const documents = await listDocuments();
		return {
			payload: {
				count: documents.length,
				documents: documents.map((doc) => ({
					id: doc.id,
					file_name: doc.file_name,
					file_type: doc.file_type,
					summary: doc.summary ?? null,
					total_chunks: doc.total_chunks,
					upload_date: doc.upload_date
				}))
			},
			sources: []
		};
	}

	throw new Error(`Unknown tool: ${name}`);
};

/** Deduplicate chunks by id, keeping the highest similarity. */
export const mergeSources = (existing: MatchedChunk[], incoming: MatchedChunk[]): MatchedChunk[] => {
	const byId = new Map<number, MatchedChunk>();
	for (const chunk of [...existing, ...incoming]) {
		const previous = byId.get(chunk.id);
		if (!previous || chunk.similarity > previous.similarity) {
			byId.set(chunk.id, chunk);
		}
	}
	return Array.from(byId.values()).sort((left, right) => right.similarity - left.similarity);
};
