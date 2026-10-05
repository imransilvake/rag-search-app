import type { ISourceListProps } from './types';

export const SourceList = ({ sources }: ISourceListProps) => {
	if (sources.length === 0) return null;

	return (
		<div className="rounded-md border border-border bg-surface-panel p-lg text-midnight shadow-sm">
			<h2 className="mb-md text-h4-semibold">Sources ({sources.length})</h2>
			<div className="space-y-md">
				{sources.map((source) => (
					<div key={source.id} className="rounded-sm border border-border bg-accent p-md">
						<p className="label-2 mb-xs text-overcast">
							<span className="label-2-sb text-foreground">Source:</span> {source.metadata?.source || source.metadata?.file_name || 'Unknown'}
							{typeof source.similarity === 'number' && <span className="ml-sm">({(source.similarity * 100).toFixed(1)}% similar)</span>}
						</p>
						<p className="label-2 line-clamp-3 text-foreground">{source.content}</p>
					</div>
				))}
			</div>
		</div>
	);
};
