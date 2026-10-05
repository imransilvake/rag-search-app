'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DocumentSummary } from '@/lib/documents/types';

const fetchDocuments = async (): Promise<DocumentSummary[]> => {
	const response = await fetch('/api/documents');
	const data = await response.json();
	if (data.error) throw new Error(data.error);
	return data.documents || [];
};

export type ISelectedDocument = {
	url: string;
	name: string;
	id?: string;
	isPDF?: boolean;
};

export const useDocumentsLibrary = () => {
	const [documents, setDocuments] = useState<DocumentSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isViewerOpen, setIsViewerOpen] = useState(false);
	const [selected, setSelected] = useState<ISelectedDocument | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const refreshDocuments = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			setDocuments(await fetchDocuments());
		} catch (caughtError) {
			setError(caughtError instanceof Error ? caughtError.message : 'Failed to fetch documents');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		let isCancelled = false;
		void (async () => {
			try {
				const next = await fetchDocuments();
				if (!isCancelled) {
					setDocuments(next);
					setError(null);
				}
			} catch (caughtError) {
				if (!isCancelled) {
					setError(caughtError instanceof Error ? caughtError.message : 'Failed to fetch documents');
				}
			} finally {
				if (!isCancelled) setIsLoading(false);
			}
		})();
		return () => {
			isCancelled = true;
		};
	}, []);

	const deleteDocument = async (id: string, name: string) => {
		if (!confirm(`Delete "${name}"? This removes the file, chunks, and embeddings.`)) return;
		setDeletingId(id);
		try {
			const response = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
			const data = await response.json();
			if (data.error) {
				alert(`Error: ${data.error}`);
			} else {
				setDocuments((previous) => previous.filter((document) => document.id !== id));
			}
		} catch (caughtError) {
			alert(caughtError instanceof Error ? caughtError.message : 'Failed to delete');
		} finally {
			setDeletingId(null);
		}
	};

	const openViewer = (document: DocumentSummary, isPDF: boolean) => {
		const url = isPDF
			? document.file_url
				? `${document.file_url}?view=true`
				: `/api/documents?id=${document.id}&file=true&view=true`
			: document.file_url || `/api/documents?id=${document.id}&file=true`;
		setSelected({ url, name: document.file_name, id: document.id, isPDF });
		setIsViewerOpen(true);
	};

	const closeViewer = () => {
		setIsViewerOpen(false);
		setSelected(null);
	};

	return {
		documents,
		isLoading,
		error,
		isUploadModalOpen,
		setIsUploadModalOpen,
		isViewerOpen,
		selected,
		deletingId,
		refreshDocuments,
		deleteDocument,
		openViewer,
		closeViewer
	};
};
