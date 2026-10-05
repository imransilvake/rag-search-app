'use client';

import { Button } from '@/atoms/button/Button';
import { DocumentTable } from '@/screens/documents/components/DocumentTable';
import { PdfViewerModal } from '@/screens/documents/components/pdf-viewer-modal/PdfViewerModal';
import { UploadModal } from '@/screens/documents/components/upload-modal/UploadModal';
import { useDocumentsLibrary } from '@/screens/documents/hooks/useDocumentsLibrary';

const DocumentsScreen = () => {
	const library = useDocumentsLibrary();

	return (
		<main className="mx-auto max-w-7xl p-xl">
			<div className="mb-lg flex items-center justify-between gap-md">
				<div className="text-midnight">
					<h1 className="text-h2">Documents</h1>
					<p className="label-1 mt-xs text-overcast">Upload files to build your searchable knowledge base.</p>
				</div>
				<Button onClick={() => library.setIsUploadModalOpen(true)}>Upload Document</Button>
			</div>

			{library.isLoading ? (
				<p className="label-1 py-3xl text-center text-overcast">Loading documents…</p>
			) : library.error ? (
				<div className="label-2 rounded-md border border-destructive/30 bg-destructive/10 p-md text-destructive">Error: {library.error}</div>
			) : library.documents.length === 0 ? (
				<div className="rounded-md border border-border bg-accent p-3xl text-center">
					<p className="label-1 mb-md text-overcast">No documents uploaded yet.</p>
					<Button variant="link" onClick={() => library.setIsUploadModalOpen(true)}>
						Upload your first document
					</Button>
				</div>
			) : (
				<DocumentTable documents={library.documents} deletingId={library.deletingId} onOpen={library.openViewer} onDelete={(id, name) => void library.deleteDocument(id, name)} />
			)}

			{library.selected && (
				<PdfViewerModal
					isOpen={library.isViewerOpen}
					onClose={library.closeViewer}
					fileUrl={library.selected.url}
					fileName={library.selected.name}
					documentId={library.selected.id}
					isPDF={library.selected.isPDF !== false}
				/>
			)}

			<UploadModal isOpen={library.isUploadModalOpen} onClose={() => library.setIsUploadModalOpen(false)} onUploadSuccess={() => void library.refreshDocuments()} />
		</main>
	);
};

export default DocumentsScreen;
