import type { MatchedChunk } from '@/lib/documents/types';
import type { ConversationDetail, ConversationMessage, ConversationSummary, MessageRole } from '@/lib/conversations/types';
import { getSupabaseAnon } from '@/lib/supabase/client';

const TITLE_MAX = 80;

const titleFromQuery = (query: string): string => {
	const trimmed = query.trim().replace(/\s+/g, ' ');
	if (trimmed.length <= TITLE_MAX) return trimmed;
	return `${trimmed.slice(0, TITLE_MAX - 1)}…`;
};

const createConversation = async (title: string): Promise<ConversationSummary> => {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase.from('conversations').insert({ title }).select('id, title, created_at, updated_at').single();

	if (error || !data) {
		throw new Error(error?.message || 'Failed to create conversation');
	}

	return data as ConversationSummary;
};

export const listConversations = async (): Promise<ConversationSummary[]> => {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase.from('conversations').select('id, title, created_at, updated_at').order('updated_at', { ascending: false });

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []) as ConversationSummary[];
};

export const getConversation = async (id: string): Promise<ConversationDetail> => {
	const supabase = getSupabaseAnon();

	const { data: conversation, error: conversationError } = await supabase.from('conversations').select('id, title, created_at, updated_at').eq('id', id).maybeSingle();

	if (conversationError || !conversation) {
		throw new Error(conversationError?.message || 'Conversation not found');
	}

	const { data: messages, error: messagesError } = await supabase
		.from('messages')
		.select('id, conversation_id, role, content, sources, created_at')
		.eq('conversation_id', id)
		.order('created_at', { ascending: true });

	if (messagesError) {
		throw new Error(messagesError.message);
	}

	return {
		...(conversation as ConversationSummary),
		messages: (messages ?? []) as ConversationMessage[]
	};
};

export const deleteConversation = async (id: string): Promise<void> => {
	const supabase = getSupabaseAnon();
	const { error } = await supabase.from('conversations').delete().eq('id', id);

	if (error) {
		throw new Error(error.message);
	}
};

const touchConversation = async (id: string): Promise<void> => {
	const supabase = getSupabaseAnon();
	await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', id);
};

const appendMessage = async (params: { conversationId: string; role: MessageRole; content: string; sources?: MatchedChunk[] | null }): Promise<ConversationMessage> => {
	const supabase = getSupabaseAnon();
	const { data, error } = await supabase
		.from('messages')
		.insert({
			conversation_id: params.conversationId,
			role: params.role,
			content: params.content,
			sources: params.sources ?? null
		})
		.select('id, conversation_id, role, content, sources, created_at')
		.single();

	if (error || !data) {
		throw new Error(error?.message || 'Failed to save message');
	}

	await touchConversation(params.conversationId);
	return data as ConversationMessage;
};

/**
 * Ensure a conversation exists, then append user + assistant turns for one search.
 */
export const persistSearchTurn = async (params: { conversationId?: string | null; query: string; answer: string; sources: MatchedChunk[] }): Promise<string> => {
	const conversationId = params.conversationId?.trim() || (await createConversation(titleFromQuery(params.query))).id;

	await appendMessage({
		conversationId,
		role: 'user',
		content: params.query
	});

	await appendMessage({
		conversationId,
		role: 'assistant',
		content: params.answer,
		sources: params.sources
	});

	return conversationId;
};
