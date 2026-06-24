import { cn, demoButton, demoCheckbox, demoFocusRing, demoInput, demoRadio } from '../storybook/styles';

/**
 * Shared Tailwind class constants for the cross-cutting "Forms" recipe stories
 * (Signal Forms + TanStack Form). They build on the central demo styles so the
 * two libraries render an identical, accessible `Field` layout — only the form
 * engine differs.
 */

/** Vertical form shell with a comfortable max width. */
export const recipeForm = 'flex w-80 flex-col gap-5';

/** A single field: stacked label, control, description and error. */
export const recipeField = 'flex flex-col gap-1.5';

/** A horizontal field: label/description on the left, control on the right. */
export const recipeFieldRow = 'flex items-start justify-between gap-4';

export const recipeFieldContent = 'flex flex-col gap-1.5';

export const recipeLabel = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
export const recipeDescription = 'text-muted-foreground text-sm';
export const recipeError = 'text-destructive text-sm';

/** Text input that turns destructive while the field is invalid. */
export const recipeInput = cn(demoInput, 'data-[invalid]:border-destructive data-[invalid]:ring-destructive/30');

/** Multi-line control mirroring the input surface. */
export const recipeTextarea = cn(
    'min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
    'placeholder:text-muted-foreground',
    'data-[invalid]:border-destructive data-[invalid]:ring-destructive/30',
    demoFocusRing
);

export const recipeSubmit = cn(demoButton.base, demoButton.primary, demoButton.size.md);
export const recipeReset = cn(demoButton.base, demoButton.outline, demoButton.size.md);
export const recipeGhostButton = cn(demoButton.base, demoButton.ghost, demoButton.size.icon);

/** Select trigger styled like the input surface. */
export const recipeSelectTrigger = cn(
    'inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm',
    'data-[placeholder]:text-muted-foreground hover:bg-muted',
    'data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30',
    demoFocusRing
);
export const recipeSelectPopup =
    'border-border bg-popover text-popover-foreground min-w-[var(--anchor-width)] rounded-lg border shadow-md';
export const recipeSelectList = 'p-1';
export const recipeSelectItem = cn(
    'text-popover-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground',
    'relative flex h-8 cursor-default items-center rounded-sm pr-8 pl-6 text-sm leading-none outline-none select-none',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
);
export const recipeSelectIndicator = 'absolute left-0 inline-flex w-6 items-center justify-center';

/** Switch parts. */
export const recipeSwitch = cn(
    'bg-muted data-[checked]:bg-primary relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    demoFocusRing
);
export const recipeSwitchThumb =
    'bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-[22px]';

/** Re-exported parts so demos can bind without re-importing the central module. */
export const recipeCheckbox = demoCheckbox;
export const recipeRadio = demoRadio;
export { cn };
