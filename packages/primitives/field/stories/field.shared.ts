import { cn, demoButton, demoInput } from '../../storybook/styles';

export const fieldLabel = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
export const fieldDescription = 'text-muted-foreground text-sm';
export const fieldError = 'text-destructive text-sm';

export const fieldInputInvalid = cn(demoInput, 'data-[invalid]:border-destructive data-[invalid]:ring-destructive/20');

export const fieldCustomTrigger = cn(
    demoInput,
    'inline-flex items-center text-left data-[filled]:text-foreground data-[focused]:ring-2 data-[focused]:ring-ring'
);

export const fieldSubmitButton = cn(demoButton.base, demoButton.primary, demoButton.size.md, 'self-start');
