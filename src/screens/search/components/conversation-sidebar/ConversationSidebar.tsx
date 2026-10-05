'use client';

import { Button } from '@/atoms/button/Button';
import { formatWhen } from '@/utils/format-date';
import type { IConversationSidebarProps } from './types';

export const ConversationSidebar = ({ conversations, activeId, isLoading, onSelect, onNew, onDelete }: IConversationSidebarProps) => (
	<aside className="flex w-full flex-col rounded-md border border-border bg-surface-panel lg:w-72 lg:shrink-0">
		<div className="flex items-center justify-between border-b border-border p-md">
			<h2 className="label-3-sb text-overcast uppercase">History</h2>
			<Button size="sm" onClick={onNew}>
				New
			</Button>
		</div>

		<div className="max-h-[28rem] flex-1 overflow-y-auto p-sm lg:max-h-none">
			{isLoading ? (
				<p className="label-2 p-md text-overcast">Loading…</p>
			) : conversations.length === 0 ? (
				<p className="label-2 p-md text-overcast">No saved chats yet. Ask a question to start one.</p>
			) : (
				<ul className="list-none space-y-xs p-0">
					{conversations.map((item) => {
						const isActive = item.id === activeId;
						return (
							<li key={item.id} className="group relative list-none">
								<button
									type="button"
									onClick={() => onSelect(item.id)}
									className={`label-2 w-full rounded-xs px-md py-sm pr-xl text-left ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-foreground hover:bg-accent'}`}>
									<span className="label-2-sb line-clamp-2">{item.title}</span>
									<span className="label-3 mt-xxs block text-overcast">{formatWhen(item.updated_at)}</span>
								</button>
								<button
									type="button"
									aria-label={`Delete ${item.title}`}
									onClick={(event) => {
										event.stopPropagation();
										onDelete(item.id);
									}}
									className="label-3 absolute top-1/2 right-sm hidden -translate-y-1/2 rounded-xs px-xs text-destructive group-hover:block hover:bg-accent">
									✕
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	</aside>
);
