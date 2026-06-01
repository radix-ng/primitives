/**
 * Centralized demo styling for Storybook examples.
 *
 * These constants are the single source of truth for how primitive demos look,
 * so stories stay visually consistent instead of copy-pasting long Tailwind
 * class strings. They build **only** on the semantic tokens defined in
 * `apps/radix-storybook/.storybook/tailwind.css` (`bg-primary`,
 * `text-primary-foreground`, `bg-muted`, `border-border`, `ring-ring`, …), so
 * they automatically respond to the Storybook light/dark theme toolbar.
 *
 * Visual reference: coss.com / Base UI. See the "Guides/Styling" docs page.
 *
 * Usage in a story:
 * ```ts
 * import { cn, demoButton } from '../../storybook/styles';
 * // template:
 * <button rdxButton [class]="cn(demoButton.base, demoButton.primary, demoButton.size.md)">…</button>
 * ```
 */

/** Join conditional class strings, dropping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(' ');
}

/**
 * Shared focus-visible ring. Matches the `--ring` token and keeps an offset so
 * the ring reads clearly on every surface.
 */
export const demoFocusRing =
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Button styling. Pair one `variant` with one `size`, on top of `base`.
 *
 * `base` already handles the disabled look for both the native `disabled`
 * attribute and the headless `data-disabled` attribute set by `RdxButtonDirective`.
 */
export const demoButton = {
    base: cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        // focusable-when-disabled keeps the control in the tab order but inert
        'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
        demoFocusRing
    ),

    /** Solid, high-emphasis. Primary action on a screen. */
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    /** Muted fill, medium emphasis. */
    secondary: 'bg-muted text-foreground hover:bg-muted/80',
    /** Bordered, transparent fill. */
    outline: 'border border-border bg-background text-foreground hover:bg-muted',
    /** No fill until hovered. Low emphasis / toolbar actions. */
    ghost: 'text-foreground hover:bg-muted',
    /** Destructive action. Uses the `destructive` semantic token. */
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',

    size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6 text-base',
        /** Square, for a single icon. */
        icon: 'size-9 p-0'
    }
} as const;

/** Card / panel surface: popovers, list rows, content boxes. */
export const demoCard = 'bg-card text-card-foreground border border-border rounded-md shadow-sm';

/** Text input surface. */
export const demoInput = cn(
    'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground',
    'placeholder:text-muted-foreground',
    demoFocusRing
);

/**
 * Avatar parts: a circular image with a text/initials fallback.
 *
 * Compose `root` with one `size`; the font size set by `size` is inherited by
 * the `fallback`.
 */
export const demoAvatar = {
    root: 'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted align-middle',
    image: 'size-full object-cover',
    fallback: 'flex size-full items-center justify-center font-medium text-foreground',
    size: {
        sm: 'size-8 text-xs',
        md: 'size-10 text-sm',
        lg: 'size-12 text-base'
    }
} as const;
