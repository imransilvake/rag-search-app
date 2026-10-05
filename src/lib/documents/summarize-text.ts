import { CHAT_MODEL, getOpenAI } from '@/lib/openai/client';

/** Cap input so huge PDFs don't blow the chat context window. */
const SUMMARY_MAX_CHARS = 12_000;

const SYSTEM_PROMPT = 'Summarize the document in 2-3 concise sentences. Cover the main topic and key points. No preamble.';

/**
 * One short document overview via the chat model.
 * Call after clean, before chunk — uses cleaned full text (truncated if needed).
 */
export const summarizeText = async (text: string): Promise<string> => {
	const trimmed = text.trim();
	if (!trimmed) {
		throw new Error('Cannot summarize empty text');
	}

	const input = trimmed.length > SUMMARY_MAX_CHARS ? `${trimmed.slice(0, SUMMARY_MAX_CHARS)}\n\n[Truncated for summarization]` : trimmed;

	const openai = getOpenAI();
	const completion = await openai.chat.completions.create({
		model: CHAT_MODEL,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: input }
		],
		temperature: 0.3,
		max_tokens: 200
	});

	const summary = completion.choices[0]?.message?.content?.trim();
	if (!summary) {
		throw new Error('Summary generation returned empty content');
	}

	return summary;
};
