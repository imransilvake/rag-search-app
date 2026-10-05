import type { MatchedChunk } from '@/lib/documents/types';

export type MessageRole = 'user' | 'assistant';

export interface ConversationSummary {
	id: string;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface ConversationMessage {
	id: string;
	conversation_id: string;
	role: MessageRole;
	content: string;
	sources: MatchedChunk[] | null;
	created_at: string;
}

export interface ConversationDetail extends ConversationSummary {
	messages: ConversationMessage[];
}
