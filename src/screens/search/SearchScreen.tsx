'use client';

import { Button } from '@/atoms/button/Button';
import { Textarea } from '@/atoms/textarea/Textarea';
import { ConversationSidebar } from '@/screens/search/components/conversation-sidebar/ConversationSidebar';
import { MessageList } from '@/screens/search/components/MessageList';
import { SourceList } from '@/screens/search/components/SourceList';
import { useSearchChat } from '@/screens/search/hooks/useSearchChat';

const SearchScreen = () => {
	const chat = useSearchChat();

	return (
		<main className="mx-auto max-w-6xl p-xl">
			<h1 className="mb-sm text-h2 text-midnight">RAG Search</h1>
			<p className="label-1 mb-lg text-overcast">
				Ask questions about your uploaded documents. Follow-ups use conversation history; the assistant can search and list your files via tools. Chats save automatically.
			</p>

			<div className="flex flex-col gap-lg lg:flex-row">
				<ConversationSidebar
					conversations={chat.conversations}
					activeId={chat.activeConversationId}
					isLoading={chat.isHistoryLoading}
					onSelect={(id) => void chat.loadConversation(id)}
					onNew={chat.startNewConversation}
					onDelete={(id) => void chat.deleteConversation(id)}
				/>

				<div className="min-w-0 flex-1">
					<MessageList messages={chat.messages} />

					<div className="mb-lg rounded-md border border-border bg-surface-panel p-lg shadow-sm">
						<Textarea
							placeholder="Ask a question about your uploaded documents…"
							value={chat.query}
							onChange={(event) => chat.setQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) void chat.search();
							}}
							rows={4}
						/>
						<Button className="mt-md" size="lg" onClick={() => void chat.search()} disabled={chat.isLoading || !chat.query.trim()}>
							{chat.isLoading ? 'Searching…' : 'Search'}
						</Button>
						<p className="label-2 mt-sm text-overcast">Press Cmd/Ctrl + Enter to search</p>
					</div>

					<SourceList sources={chat.sources} />

					{chat.error && (
						<div className="mt-lg rounded-md border border-destructive/40 bg-destructive/15 p-lg" role="alert">
							<p className="label-1 text-destructive">{chat.error}</p>
						</div>
					)}

					{!chat.messages.length && !chat.error && chat.answer && (
						<div className="mt-lg rounded-md border border-border bg-surface-panel p-lg shadow-sm">
							<h2 className="mb-md text-h4-semibold text-midnight">Answer</h2>
							<p className="label-1 whitespace-pre-wrap text-foreground">{chat.answer}</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
};

export default SearchScreen;
