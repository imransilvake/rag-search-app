import type { VariantProps } from 'tailwind-variants';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { buttonVariants } from './styles';

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: NonNullable<VariantProps<typeof buttonVariants>['variant']>;
	size?: NonNullable<VariantProps<typeof buttonVariants>['size']>;
	isFullWidth?: boolean;
}

export type IButtonStylesProps = VariantProps<typeof buttonVariants>;
