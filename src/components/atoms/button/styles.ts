import { tv } from 'tailwind-variants';

export const buttonVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center gap-sm whitespace-nowrap transition-colors outline-none',
		'focus-visible:ring-1 focus-visible:ring-ring',
		'disabled:pointer-events-none disabled:opacity-30'
	],
	variants: {
		variant: {
			primary: 'rounded-xs bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
			secondary: 'rounded-xs bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
			tertiary: 'rounded-xs px-lg py-sm text-primary hover:bg-accent active:bg-accent-active',
			destructive: 'rounded-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
			ghost: 'rounded-xs text-overcast hover:bg-accent hover:text-accent-foreground active:bg-accent-active',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			sm: 'label-3-m h-8 px-md py-xs',
			md: 'label-2 h-10 px-lg py-sm',
			lg: 'label-1-m h-11 px-xl py-sm'
		},
		isFullWidth: {
			true: 'w-full',
			false: ''
		}
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
		isFullWidth: false
	}
});
