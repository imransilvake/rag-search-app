import type { ChatCompletionMessageParam, ChatCompletionToolMessageParam } from 'openai/resources/chat/completions';
import type { MatchedChunk, RagSearchResult } from '@/lib/documents/types';
import { CHAT_MODEL, getOpenAI } from '@/lib/openai/client';
import { executeRagTool, mergeSources, RAG_TOOLS } from '@/lib/rag/tools';

const SYSTEM_PROMPT = `You are a helpful assistant for a personal document library.
Use tools to look up information from uploaded documents before answering factual questions.
If tools return nothing relevant, say you do not know based on the available documents.
Answer clearly. Prefer citing file names when you use document content.
Follow-up questions may refer to earlier turns — use conversation history.`;

const MAX_HISTORY_MESSAGES = 20;
const MAX_TOOL_ROUNDS = 5;

export type ChatHistoryMessage = {
	role: 'user' | 'assistant';
	content: string;
};

export type ChatWithDocumentsParams = {
	query: string;
	/** Prior turns in this conversation (oldest first). Does not include the current query. */
	history?: ChatHistoryMessage[];
};

const toOpenAIHistory = (history: ChatHistoryMessage[]): ChatCompletionMessageParam[] => {
	const recent = history.slice(-MAX_HISTORY_MESSAGES);
	return recent
		.filter((message) => message.content.trim())
		.map((message) => ({
			role: message.role,
			content: message.content
		}));
};

/**
 * Multi-turn chat with OpenAI tool calling over the document corpus.
 */
export const chatWithDocuments = async (params: ChatWithDocumentsParams): Promise<RagSearchResult> => {
	const trimmed = params.query.trim();
	if (!trimmed) {
		throw new Error('Query is required');
	}

	const messages: ChatCompletionMessageParam[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...toOpenAIHistory(params.history ?? []), { role: 'user', content: trimmed }];

	const openai = getOpenAI();
	let sources: MatchedChunk[] = [];

	for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
		const completion = await openai.chat.completions.create({
			model: CHAT_MODEL,
			messages,
			tools: RAG_TOOLS,
			tool_choice: 'auto'
		});

		const choice = completion.choices[0]?.message;
		if (!choice) {
			throw new Error('No response from chat model');
		}

		messages.push(choice);

		const toolCalls = choice.tool_calls;
		if (!toolCalls?.length) {
			return {
				answer: choice.content?.trim() || 'No answer generated',
				sources
			};
		}

		for (const call of toolCalls) {
			if (call.type !== 'function') continue;

			let toolResult: ChatCompletionToolMessageParam;
			try {
				const executed = await executeRagTool(call.function.name, call.function.arguments || '{}');
				sources = mergeSources(sources, executed.sources);
				toolResult = {
					role: 'tool',
					tool_call_id: call.id,
					content: JSON.stringify(executed.payload)
				};
			} catch (error) {
				toolResult = {
					role: 'tool',
					tool_call_id: call.id,
					content: JSON.stringify({
						error: error instanceof Error ? error.message : 'Tool failed'
					})
				};
			}
			messages.push(toolResult);
		}
	}

	// Final pass without tools if the model kept calling tools
	const final = await openai.chat.completions.create({
		model: CHAT_MODEL,
		messages: [
			...messages,
			{
				role: 'user',
				content: 'Please answer now using the tool results already available. Do not call more tools.'
			}
		]
	});

	return {
		answer: final.choices[0]?.message?.content?.trim() || 'No answer generated',
		sources
	};
};
