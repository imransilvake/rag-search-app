'use client';

import { useState } from 'react';
import { Button } from '@/atoms/button/Button';
import { ModalShell } from '@/atoms/modal-shell/ModalShell';
import type { IUploadFeedback, IUploadModalProps } from './types';

const UploadModalBody = ({ onClose, onUploadSuccess }: { onClose: () => void; onUploadSuccess?: () => void }) => {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [message, setMessage] = useState<IUploadFeedback | null>(null);

	const onUpload = async () => {
		if (!file) {
			setMessage({ type: 'error', text: 'Please select a file' });
			return;
		}

		setIsUploading(true);
		setMessage(null);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload', { method: 'POST', body: formData });
			const data = await response.json();

			if (!data.success) {
				setMessage({ type: 'error', text: data.error || 'Upload failed' });
				return;
			}

			setMessage({
				type: 'success',
				text: `File "${data.fileName}" uploaded. Processed ${data.chunks} chunks.`
			});
			setFile(null);
			window.setTimeout(() => {
				onUploadSuccess?.();
				onClose();
			}, 1200);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Upload failed'
			});
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<ModalShell onClose={onClose} title="Upload Document" contentClassName="max-h-[90vh] overflow-y-auto">
			<div className="p-lg">
				<label htmlFor="upload-file-input" className="label-2-m mb-sm block text-foreground">
					Select a file (PDF, DOCX, or TXT)
				</label>
				<input
					id="upload-file-input"
					type="file"
					accept=".pdf,.docx,.txt"
					onChange={(event) => {
						setFile(event.target.files?.[0] ?? null);
						setMessage(null);
					}}
					className="label-2 file:label-2-sb block w-full text-overcast file:mr-md file:rounded-xs file:border-0 file:bg-secondary file:px-md file:py-sm file:text-secondary-foreground hover:file:bg-secondary-hover"
				/>

				{file && (
					<div className="label-2 mt-md space-y-xs rounded-sm bg-accent p-md text-overcast">
						<p>
							<span className="label-2-sb text-foreground">Selected:</span> {file.name}
						</p>
						<p>
							<span className="label-2-sb text-foreground">Size:</span> {(file.size / 1024).toFixed(2)} KB
						</p>
					</div>
				)}

				<Button className="mt-lg" size="lg" isFullWidth onClick={() => void onUpload()} disabled={!file || isUploading}>
					{isUploading ? 'Uploading and processing…' : 'Upload Document'}
				</Button>

				{message && <div className={`label-2 mt-md rounded-sm p-md ${message.type === 'success' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{message.text}</div>}

				<p className="label-2 mt-lg text-overcast">Files are chunked and embedded for semantic search. Large PDFs take longer because each chunk calls the embeddings API.</p>
			</div>
		</ModalShell>
	);
};

/** Unmounts when closed so form state resets without effect-driven setState. */
export const UploadModal = ({ isOpen, onClose, onUploadSuccess }: IUploadModalProps) => {
	if (!isOpen) return null;
	return <UploadModalBody onClose={onClose} onUploadSuccess={onUploadSuccess} />;
};
