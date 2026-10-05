import { buttonVariants } from './styles';
import type { IButtonProps } from './types';

export const Button = ({ children, className, variant, size, isFullWidth, type = 'button', ...props }: IButtonProps) => (
	<button type={type} className={buttonVariants({ variant, size, isFullWidth, className })} {...props}>
		{children}
	</button>
);
