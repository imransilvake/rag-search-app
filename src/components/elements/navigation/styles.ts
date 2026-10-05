import { tv } from 'tailwind-variants';

export const navigationVariants = tv({
	slots: {
		nav: 'z-header border-b border-border bg-background',
		inner: 'mx-auto flex max-w-7xl items-center justify-between gap-md px-md sm:px-lg',
		links: 'flex space-x-xl',
		link: 'label-2-m border-b-2 px-xs py-md',
		actions: 'flex items-center gap-sm'
	},
	variants: {
		isActive: {
			true: {
				link: 'border-primary text-primary'
			},
			false: {
				link: 'border-transparent text-overcast hover:border-border hover:text-foreground'
			}
		}
	}
});
