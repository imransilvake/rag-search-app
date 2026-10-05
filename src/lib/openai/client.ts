import OpenAI from 'openai';
import { getOpenAIApiKey } from '@/lib/env';

let client: OpenAI | null = null;

export const getOpenAI = (): OpenAI => {
	if (!client) {
		client = new OpenAI({ apiKey: getOpenAIApiKey() });
	}
	return client;
};

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const CHAT_MODEL = 'gpt-4o-mini';
