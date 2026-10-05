import { Button } from '@/atoms/button/Button';
import { modalShellVariants } from './styles';
import type { IModalShellProps } from './types';

export const ModalShell = ({ children, onClose, title, maxWidthClassName = 'max-w-2xl', contentClassName }: IModalShellProps) => {
	const styles = modalShellVariants();

	return (
		<div className={styles.backdrop()} onClick={onClose} role="presentation">
			<div className={`${styles.panel()} ${maxWidthClassName} ${contentClassName ?? ''}`} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
				<div className={styles.header()}>
					<h2 className={styles.title()}>{title}</h2>
					<Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
						✕
					</Button>
				</div>
				{children}
			</div>
		</div>
	);
};
