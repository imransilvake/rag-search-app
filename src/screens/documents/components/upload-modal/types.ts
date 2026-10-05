export interface IUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUploadSuccess?: () => void;
}

export type IUploadFeedback = { type: 'success' | 'error'; text: string };
