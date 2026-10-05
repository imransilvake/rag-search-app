import { tv } from 'tailwind-variants';

export const modalShellVariants = tv({
	slots: {
		backdrop: 'fixed inset-0 z-overlay flex items-center justify-center bg-surface-fog p-md',
		panel: 'relative z-modal w-full overflow-hidden rounded-md bg-surface-panel shadow-lg',
		header: 'flex items-center justify-between border-b border-border p-md',
		title: 'mr-md flex-1 truncate text-h4-semibold text-midnight',
		close: ''
	}
});
