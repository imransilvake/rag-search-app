export interface IPdfViewerModalProps {
	isOpen: boolean;
	onClose: () => void;
	fileUrl: string;
	fileName: string;
	documentId?: string;
	isPDF?: boolean;
}
