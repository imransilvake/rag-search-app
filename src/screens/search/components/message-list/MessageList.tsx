import type { IMessageListProps } from './types';

export const MessageList = ({ messages }: IMessageListProps) => {
	if (messages.length === 0) return null;

	return (
		<div className="mb-lg space-y-md">
			{messages.map((message) => (
				<div
					key={message.id}
					className={`rounded-md border p-md ${message.role === 'user' ? 'border-primary/20 bg-secondary text-secondary-foreground' : 'border-border bg-surface-panel text-foreground'}`}>
					<p className="label-3-sb mb-xs text-overcast uppercase">{message.role === 'user' ? 'You' : 'Assistant'}</p>
					<p className="label-1 whitespace-pre-wrap">{message.content}</p>
				</div>
			))}
		</div>
	);
};
