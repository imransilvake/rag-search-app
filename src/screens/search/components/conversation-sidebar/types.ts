import type { ConversationSummary } from '@/lib/conversations/types';

export interface IConversationSidebarProps {
	conversations: ConversationSummary[];
	activeId: string | null;
	isLoading: boolean;
	onSelect: (id: string) => void;
	onNew: () => void;
	onDelete: (id: string) => void;
}
