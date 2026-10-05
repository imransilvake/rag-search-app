'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ConversationMessage, ConversationSummary } from '@/lib/conversations/types';
import type { MatchedChunk } from '@/lib/documents/types';

const lastAssistantSources = (messages: ConversationMessage[]): MatchedChunk[] => {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const message = messages[index];
		if (message.role === 'assistant' && message.sources?.length) {
			return message.sources;
		}
	}
	return [];
};

const fetchConversationList = async (): Promise<ConversationSummary[]> => {
	const response = await fetch('/api/conversations');
	const data = await response.json();
	if (data.error) return [];
	return data.conversations || [];
};

export const useSearchChat = () => {
	const [query, setQuery] = useState('');
	const [answer, setAnswer] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [sources, setSources] = useState<MatchedChunk[]>([]);
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [conversations, setConversations] = useState<ConversationSummary[]>([]);
	const [isHistoryLoading, setIsHistoryLoading] = useState(true);
	const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

	const refreshConversations = useCallback(async () => {
		try {
			setConversations(await fetchConversationList());
		} catch {
			// Keep existing list if refresh fails
		} finally {
			setIsHistoryLoading(false);
		}
	}, []);

	useEffect(() => {
		let isCancelled = false;
		void (async () => {
			try {
				const list = await fetchConversationList();
				if (!isCancelled) setConversations(list);
			} catch {
				if (!isCancelled) setConversations([]);
			} finally {
				if (!isCancelled) setIsHistoryLoading(false);
			}
		})();
		return () => {
			isCancelled = true;
		};
	}, []);

	const startNewConversation = () => {
		setActiveConversationId(null);
		setMessages([]);
		setQuery('');
		setAnswer('');
		setError(null);
		setSources([]);
	};

	const loadConversation = async (id: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`/api/conversations?id=${id}`);
			const data = await response.json();
			if (data.error) {
				setError(data.error);
				return;
			}
			const nextMessages: ConversationMessage[] = data.messages || [];
			setActiveConversationId(data.id);
			setMessages(nextMessages);
			setQuery('');
			const lastAssistant = [...nextMessages].reverse().find((message) => message.role === 'assistant');
			setAnswer(lastAssistant?.content || '');
			setSources(lastAssistantSources(nextMessages));
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : 'Failed to load');
		} finally {
			setIsLoading(false);
		}
	};

	const deleteConversation = async (id: string) => {
		if (!confirm('Delete this conversation?')) return;
		try {
			const response = await fetch(`/api/conversations?id=${id}`, { method: 'DELETE' });
			const data = await response.json();
			if (data.error) {
				alert(data.error);
				return;
			}
			if (activeConversationId === id) startNewConversation();
			await refreshConversations();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete');
		}
	};

	const search = async () => {
		if (!query.trim()) return;
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query, conversationId: activeConversationId })
			});
			const data = await response.json();
			if (data.error) {
				setError(data.error);
				return;
			}
			setAnswer(data.answer || 'No answer generated');
			setSources(data.sources || []);
			if (typeof data.conversationId === 'string') setActiveConversationId(data.conversationId);
			setQuery('');
			await refreshConversations();
			if (data.conversationId) {
				const detailResponse = await fetch(`/api/conversations?id=${data.conversationId}`);
				const detail = await detailResponse.json();
				if (!detail.error) setMessages(detail.messages || []);
			}
		} catch (searchError) {
			setError(searchError instanceof Error ? searchError.message : 'Search failed');
		} finally {
			setIsLoading(false);
		}
	};

	return {
		query,
		setQuery,
		answer,
		error,
		isLoading,
		sources,
		messages,
		conversations,
		isHistoryLoading,
		activeConversationId,
		startNewConversation,
		loadConversation,
		deleteConversation,
		search
	};
};
