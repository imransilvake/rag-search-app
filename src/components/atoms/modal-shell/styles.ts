import { tv } from 'tailwind-variants';

export const modalShellVariants = tv({
	slots: {
		backdrop: 'fixed inset-0 z-overlay flex items-center justify-center bg-surface-fog p-md',
		panel: 'relative z-modal w-full overflow-hidden rounded-md bg-surface-panel shadow-lg',
		// Color on header — never combine text-h* with text-{color} on the same node (tailwind-merge drops the size).
		header: 'flex items-center justify-between gap-md border-b border-border p-md text-midnight',
		title: 'min-w-0 flex-1 truncate text-h4-semibold'
	}
});
