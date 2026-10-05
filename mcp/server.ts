/**
 * Stdio MCP server so Cursor (and other MCP clients) can search this app's docs.
 *
 * Run: yarn mcp
 * Configure in Cursor: see docs/MCP.md
 *
 * Logs go to stderr — stdout is reserved for MCP JSON-RPC.
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { z } from 'zod';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
loadEnv({ path: resolve(process.cwd(), '.env') });

const main = async () => {
	const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
	const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
	const { listDocuments } = await import('../src/lib/documents/repository');
	const { retrieveRelevantChunks } = await import('../src/lib/rag/retrieve');

	const server = new McpServer({
		name: 'rag-search-app',
		version: '0.1.0'
	});

	server.registerTool(
		'search_documents',
		{
			title: 'Search documents',
			description: "Semantically search the RAG app's uploaded document corpus. Returns relevant text chunks with similarity scores and source file names.",
			inputSchema: {
				query: z.string().min(1).describe('Focused natural-language search query'),
				match_count: z.number().int().min(1).max(10).optional().describe('Max chunks to return (1–10). Default 5.')
			}
		},
		async ({ query, match_count }) => {
			try {
				const chunks = await retrieveRelevantChunks(query, {
					matchCount: match_count ?? 5
				});
				const payload = {
					count: chunks.length,
					chunks: chunks.map((chunk) => ({
						id: chunk.id,
						similarity: chunk.similarity,
						source: chunk.metadata?.source || chunk.metadata?.file_name || 'Unknown',
						file_name: chunk.metadata?.file_name,
						chunk_index: chunk.metadata?.chunk_index,
						content: chunk.content
					}))
				};
				return {
					content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }]
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return {
					content: [{ type: 'text' as const, text: `search_documents failed: ${message}` }],
					isError: true
				};
			}
		}
	);

	server.registerTool(
		'list_documents',
		{
			title: 'List documents',
			description: 'List uploaded documents in the RAG app (file name, type, summary, chunk count).',
			inputSchema: {}
		},
		async () => {
			try {
				const documents = await listDocuments();
				const payload = {
					count: documents.length,
					documents: documents.map((doc) => ({
						id: doc.id,
						file_name: doc.file_name,
						file_type: doc.file_type,
						summary: doc.summary ?? null,
						total_chunks: doc.total_chunks,
						upload_date: doc.upload_date
					}))
				};
				return {
					content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }]
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return {
					content: [{ type: 'text' as const, text: `list_documents failed: ${message}` }],
					isError: true
				};
			}
		}
	);

	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('rag-search-app MCP server running on stdio');
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
