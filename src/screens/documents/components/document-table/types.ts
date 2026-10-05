import type { DocumentSummary } from '@/lib/documents/types';

export interface IDocumentTableProps {
	documents: DocumentSummary[];
	deletingId: string | null;
	onOpen: (document: DocumentSummary, isPDF: boolean) => void;
	onDelete: (id: string, name: string) => void;
}
