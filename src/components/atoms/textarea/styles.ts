import { tv } from 'tailwind-variants';

export const textareaVariants = tv({
	base: ['label-1 w-full resize-none rounded-sm border border-border bg-input p-md text-foreground shadow-sm', 'placeholder:text-overcast', 'focus-visible:border-ring focus-visible:outline-none']
});
