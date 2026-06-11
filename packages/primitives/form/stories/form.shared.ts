import { cn, demoButton, demoInput } from '../../storybook/styles';

export const formField = 'flex flex-col gap-1.5';
export const formLabel = 'text-foreground text-sm font-medium';
export const formError = 'text-destructive text-sm';
export const formInput = cn(demoInput, 'data-[invalid]:border-destructive data-[invalid]:ring-destructive/30');
export const formSubmit = cn(demoButton.base, demoButton.primary, demoButton.size.md, 'self-start');
export const formReset = cn(demoButton.base, demoButton.outline, demoButton.size.md);
