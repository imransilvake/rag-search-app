'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/atoms/button/Button';
import { ModalShell } from '@/atoms/modal-shell/ModalShell';
import type { IPdfViewerModalProps } from './types';

const PdfViewerBody = ({ onClose, fileUrl, fileName, documentId, isPDF = true }: Omit<IPdfViewerModalProps, 'isOpen'>) => {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(isPDF);
	const [activeTab, setActiveTab] = useState<'preview' | 'content'>(isPDF ? 'preview' : 'content');
	const [text, setText] = useState('');
	const [isTextLoading, setIsTextLoading] = useState(false);
	const [textError, setTextError] = useState<string | null>(null);

	/** Prefer same-origin API for iframe/probe so Supabase Storage CORS cannot block preview. */
	const previewUrl = documentId ? `/api/documents?id=${documentId}&file=true&view=true` : fileUrl;

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	useEffect(() => {
		if (!isPDF || !previewUrl) {
			return;
		}

		let isCancelled = false;
		fetch(previewUrl, { method: 'GET' })
			.then(async (response) => {
				const contentType = response.headers.get('content-type') ?? '';
				if (contentType.includes('application/json')) {
					const data = await response.json();
					throw new Error(data.error || 'File not available');
				}
				if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
				if (!isCancelled) setIsLoading(false);
			})
			.catch((caughtError: unknown) => {
				if (isCancelled) return;
				setError(caughtError instanceof Error ? caughtError.message : 'Failed to load PDF');
				setIsLoading(false);
			});

		return () => {
			isCancelled = true;
		};
	}, [previewUrl, isPDF]);

	useEffect(() => {
		if (!documentId || activeTab !== 'content' || text || textError) {
			return;
		}

		let isCancelled = false;
		const load = async () => {
			setIsTextLoading(true);
			try {
				const response = await fetch(`/api/documents?id=${documentId}`);
				const data = await response.json();
				if (isCancelled) return;
				if (data.error) {
					setTextError(data.error);
				} else {
					setText(data.fullText || 'No text content available');
				}
			} catch (caughtError) {
				if (!isCancelled) {
					setTextError(caughtError instanceof Error ? caughtError.message : 'Failed to fetch document text');
				}
			} finally {
				if (!isCancelled) setIsTextLoading(false);
			}
		};

		void load();
		return () => {
			isCancelled = true;
		};
	}, [documentId, activeTab, text, textError]);

	return (
		<ModalShell onClose={onClose} title={fileName} maxWidthClassName="max-w-6xl" contentClassName="flex h-[90vh] flex-col">
			{isPDF && (
				<div className="flex border-b border-border">
					{(['preview', 'content'] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={`label-2-m flex-1 px-md py-md transition-colors ${activeTab === tab ? 'border-b-2 border-primary bg-secondary text-primary' : 'text-overcast hover:bg-accent'}`}>
							{tab === 'preview' ? 'Preview' : 'Content'}
						</button>
					))}
				</div>
			)}

			<div className="flex-1 overflow-hidden">
				{isPDF && activeTab === 'preview' && (
					<div className="h-full overflow-hidden">
						{error ? (
							<div className="flex h-full flex-col items-center justify-center p-xl">
								<div className="max-w-md rounded-md border border-warning/40 bg-warning/15 p-lg text-warning-foreground">
									<h3 className="mb-sm text-h4-semibold">PDF not available</h3>
									<p className="label-2 mb-md text-overcast">{error}</p>
									{documentId && <Button onClick={() => setActiveTab('content')}>View extracted text</Button>}
								</div>
							</div>
						) : isLoading ? (
							<div className="label-1 flex h-full items-center justify-center text-overcast">Loading PDF…</div>
						) : (
							<iframe src={`${previewUrl}#toolbar=1`} className="h-full w-full border-0" title={fileName} allow="fullscreen" />
						)}
					</div>
				)}

				{(!isPDF || activeTab === 'content') && (
					<div className="h-full overflow-auto p-lg">
						{isTextLoading ? (
							<p className="label-1 text-overcast">Loading…</p>
						) : textError ? (
							<p className="label-2 text-destructive">Error: {textError}</p>
						) : (
							<pre className="label-2 rounded-sm bg-accent p-md font-mono whitespace-pre-wrap text-foreground">{text || 'No text content available'}</pre>
						)}
					</div>
				)}
			</div>
		</ModalShell>
	);
};

/** Unmounts when closed so viewer state resets cleanly. */
export const PdfViewerModal = ({ isOpen, ...props }: IPdfViewerModalProps) => {
	if (!isOpen) return null;
	return <PdfViewerBody {...props} />;
};
