import { textareaVariants } from './styles';
import type { ITextareaProps } from './types';

export const Textarea = ({ className, ...props }: ITextareaProps) => <textarea className={textareaVariants({ className })} {...props} />;
