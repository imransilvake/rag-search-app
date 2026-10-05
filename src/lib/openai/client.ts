import OpenAI from 'openai';
import { getOpenAIApiKey } from '@/lib/env';

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
	if (!client) {
		client = new OpenAI({ apiKey: getOpenAIApiKey() });
	}
	return client;
}

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;
export const CHAT_MODEL = 'gpt-4o-mini';
