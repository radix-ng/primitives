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

/** Popover surfaces and parts. */
export const demoPopover = {
    positioner: 'z-50',
    popup: cn(demoCard, 'relative w-80 p-4'),
    popupAnimated: 'data-[state=open]:animate-popover-popup-in data-[state=closed]:animate-popover-popup-out',
    portalAnimated: 'data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out',
    backdrop: 'fixed inset-0 bg-foreground/10',
    arrow: 'fill-popover',
    title: 'text-sm font-semibold text-popover-foreground',
    description: 'mt-1 text-sm text-muted-foreground',
    close: cn(demoButton.base, demoButton.ghost, 'absolute top-2 right-2 size-7 p-0')
} as const;

/**
 * Checkbox parts: a small square button toggling a centered indicator.
 *
 * The indicator keeps `data-[state=unchecked]:hidden` because its `flex` display
 * would otherwise override the native `[hidden]` attribute set by the directive.
 */
export const demoCheckbox = {
    button: cn(
        'flex size-6 items-center justify-center rounded-md border border-border bg-background shadow-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        demoFocusRing
    ),
    indicator: 'flex items-center text-primary data-[state=unchecked]:hidden'
} as const;

/**
 * Radio parts: a small circular item with a centered dot indicator.
 *
 * The indicator keeps `data-[state=unchecked]:hidden` because its `flex`
 * display would otherwise override the native `[hidden]` attribute set by the
 * directive.
 */
export const demoRadio = {
    item: cn(
        'flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm',
        'hover:bg-muted',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        demoFocusRing
    ),
    indicator:
        'flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full after:bg-primary data-[state=unchecked]:hidden',
    row: 'flex items-center gap-3',
    label: 'text-foreground text-sm font-medium',
    group: 'flex flex-col gap-2.5'
} as const;

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

/**
 * Accordion parts: vertical (default) and horizontal layouts.
 *
 * Vertical root: add `w-[300px]`. Horizontal root: add `flex flex-row h-[300px]`.
 * Horizontal items: compose `item` + `itemH`. Horizontal trigger: compose `trigger` + `triggerH`.
 * Animations require `--animate-accordion-*` defined in `tailwind.css`.
 */
export const demoAccordion = {
    // `overflow-hidden` clips the square item/trigger backgrounds to the rounded corners.
    root: 'overflow-hidden rounded-xl border border-border bg-card shadow-xs',
    item: cn(
        'overflow-hidden border-b border-border last:border-b-0',
        // `ring-inset` keeps the focus ring inside the item so `overflow-hidden` on the root doesn't clip it.
        'focus-within:relative focus-within:z-[1] focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring'
    ),
    itemH: 'flex border-b-0 border-r border-border last:border-r-0',
    header: 'flex',
    trigger: cn(
        'flex h-12 w-full flex-1 cursor-default items-center justify-between px-5 text-[15px]',
        'bg-background text-foreground transition-colors hover:bg-muted',
        'data-[disabled=true]:text-muted-foreground'
    ),
    triggerH: '[writing-mode:vertical-rl] h-full px-0 py-5',
    content: cn(
        'overflow-hidden text-[15px] text-muted-foreground bg-muted',
        '[&[data-state=open][data-orientation=vertical]]:animate-accordion-down',
        '[&[data-state=closed][data-orientation=vertical]]:animate-accordion-up',
        '[&[data-state=open][data-orientation=horizontal]]:animate-accordion-right',
        '[&[data-state=closed][data-orientation=horizontal]]:animate-accordion-left'
    ),
    contentText: 'px-5 py-4'
} as const;

/** Tooltip parts: a small popup anchored to a trigger. */
export const demoTooltip = {
    positioner: 'z-50',
    popup: 'border-border bg-popover text-popover-foreground select-none rounded-md border px-3 py-2 text-sm leading-none shadow-md',
    arrow: 'fill-popover'
} as const;

/**
 * Menubar parts: horizontal application menu bar.
 *
 * `root` is the horizontal container. `trigger` styles each top-level button.
 * Content popup and items reuse `demoMenu.*`.
 */
export const demoMenubar = {
    root: 'inline-flex items-center rounded-md border border-border bg-background p-1 shadow-sm',
    trigger: cn(
        'flex h-8 cursor-default select-none items-center rounded-sm px-3 text-sm font-medium outline-none',
        'hover:bg-muted focus-visible:bg-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    shortcut: 'ml-auto pl-4 text-xs text-muted-foreground data-[highlighted]:text-foreground'
} as const;

/**
 * Menu parts: dropdown / context menus.
 *
 * Popup uses `bg-popover` so it lifts off the page. Items highlight via
 * `data-[highlighted]` which the directives set on focus.
 */
export const demoMenu = {
    positioner: 'z-50 data-[closed]:pointer-events-none',
    popup: cn(
        'bg-popover text-popover-foreground',
        'min-w-[8rem] rounded-md border border-border p-1 shadow-md',
        'data-[closed]:hidden data-[closed]:pointer-events-none'
    ),
    item: cn(
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
        'data-[highlighted]:bg-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    /** Checkbox / radio items need left padding for the indicator. */
    selectableItem: cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'data-[highlighted]:bg-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    /** Absolute-positioned span wrapping the check/dot icon. */
    itemIndicator: 'absolute left-2 flex size-3.5 items-center justify-center',
    separator: '-mx-1 my-1 h-px bg-border',
    groupLabel: 'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
    /**
     * Arrow span: SVG uses fill="currentColor" so set CSS `color` to match the popup surface.
     * drop-shadow outlines the triangle in the border color so it's visible on light backgrounds.
     */
    arrow: cn('text-popover', '[filter:drop-shadow(0_0_1px_var(--color-border))]')
} as const;
