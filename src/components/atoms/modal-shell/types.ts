import type { ReactNode } from 'react';

export interface IModalShellProps {
	children: ReactNode;
	onClose: () => void;
	title: string;
	maxWidthClassName?: string;
	contentClassName?: string;
}
