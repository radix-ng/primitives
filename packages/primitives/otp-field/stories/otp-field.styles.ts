import { cn, demoFocusRing } from '../../storybook/styles';

/** Shared presentation for the OTP Field examples; the primitive itself remains headless. */
export const otpFieldStyles = {
    root: 'flex items-center gap-2',
    slot: cn(
        'size-10 rounded-md border border-border bg-background text-center font-mono text-lg text-foreground',
        'placeholder:text-muted-foreground',
        demoFocusRing
    ),
    separator: 'px-1 text-muted-foreground',
    label: 'mb-2 block text-sm font-medium text-foreground',
    description: 'mt-2 text-sm text-muted-foreground',
    field: 'grid gap-1.5',
    form: 'grid max-w-md gap-5',
    submit: 'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
} as const;
