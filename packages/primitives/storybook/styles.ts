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

/**
 * Popup arrow recipe shared by tooltip / popover / menu / navigation-menu demos.
 *
 * The SVG arrow fills with `currentColor`, so `surface` must be a `text-*` token matching the popup
 * background (`text-popover`, `text-card`, …) — not a `fill-*` class, which never reaches the
 * polygon. `my-px` overlaps the base 1px into the popup (our arrows sit at `bottom:0`/`top:0` plus a
 * translate, so a positive margin pulls the base toward the popup and punches a notch in its
 * border), and the directional `0 1px 0` border-colored drop-shadow continues that border down the
 * arrow's two diagonal edges to the tip — so popup and arrow read as one continuous shape.
 */
export const demoArrow = (surface: string) => cn(surface, 'my-px drop-shadow-[0_1px_0_var(--color-border)]');

/** Text input surface. */
export const demoInput = cn(
    'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground',
    'placeholder:text-muted-foreground',
    demoFocusRing
);

/**
 * Editable (inline edit) parts: a focusable preview that swaps to an input.
 *
 * `preview` and `input` share the same box metrics so the swap doesn't shift layout.
 * The placeholder look is driven by `[data-placeholder-shown]` set on the preview.
 */
export const demoEditable = {
    root: 'flex w-[260px] flex-col gap-3',
    preview: cn(
        'inline-block min-h-9 w-full rounded-md border border-transparent px-3 py-1.5 text-sm text-foreground',
        'cursor-text hover:bg-muted data-[placeholder-shown]:text-muted-foreground',
        demoFocusRing
    ),
    input: demoInput,
    controls: 'flex gap-2'
} as const;

/** Calendar parts: card-framed month grid with circular day cells driven by `data-*` state. */
export const demoCalendar = {
    root: 'w-[300px] rounded-xl border border-border bg-background p-4 shadow-sm',
    header: 'flex items-center justify-between',
    heading: 'text-sm font-medium text-foreground',
    nav: cn(
        'inline-flex size-7 items-center justify-center rounded-md text-foreground',
        'hover:bg-muted cursor-pointer',
        demoFocusRing
    ),
    grid: 'mt-4 w-full border-collapse select-none',
    headRow: 'grid w-full grid-cols-7',
    headCell: 'rounded-md text-center text-xs text-muted-foreground',
    body: 'grid',
    weekRow: 'grid grid-cols-7',
    cell: 'relative text-center text-sm',
    day: cn(
        'relative mx-auto flex size-8 items-center justify-center rounded-full text-sm text-foreground outline-none',
        'hover:bg-muted cursor-pointer',
        'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary',
        'data-[highlighted]:bg-muted',
        'data-[outside-view]:text-muted-foreground/60',
        'data-[unavailable]:pointer-events-none data-[unavailable]:text-muted-foreground/60 data-[unavailable]:line-through',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        // today marker: a small dot above the number
        "data-[today]:before:bg-primary data-[today]:before:absolute data-[today]:before:top-1 data-[today]:before:size-1 data-[today]:before:rounded-full data-[today]:before:content-['']",
        demoFocusRing
    )
} as const;

/**
 * Dialog surfaces and parts: a centered modal popup over a dimmed backdrop.
 *
 * `backdropAnimated` goes on the `rdxDialogBackdrop` element: since the structural
 * `rdxDialogPortal` made backdrop + popup the presence roots, the backdrop's overlay-fade exit
 * keyframes are (with the popup's) what the presence machine waits for before unmounting.
 * `popupAnimated` drives the popup's own zoom; centering is handled by the `translate` property
 * (Tailwind utilities), so the `dialog-popup-*` keyframes animate scale only.
 *
 * For scrollable dialogs, use `viewport` (a fixed full-screen scroll container) with `popupStatic`
 * (a non-fixed popup centered by the viewport's flex layout). `scrollBody` makes an inner region
 * scroll while the popup stays fixed on screen (inside scroll). `data-nested-dialog-open` /
 * `data-nested` hooks let a parent popup react when a nested dialog opens.
 */
export const demoDialog = {
    backdropAnimated: 'data-[state=open]:animate-dialog-overlay-in data-[state=closed]:animate-dialog-overlay-out',
    backdrop: 'fixed inset-0 z-50 bg-foreground/50',
    popup: cn(
        demoCard,
        'fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6',
        'transition-[transform,scale] data-[nested-dialog-open]:scale-[0.96]',
        'focus:outline-none'
    ),
    popupAnimated: 'data-[state=open]:animate-dialog-popup-in data-[state=closed]:animate-dialog-popup-out',
    /** Fixed full-screen scroll container; place the popup inside for outside-scroll dialogs. */
    viewport: 'fixed inset-0 z-50 flex justify-center overflow-y-auto p-6',
    /** Popup centered by the viewport's flex layout (not fixed-positioned). */
    popupStatic: cn(demoCard, 'relative my-auto w-[90vw] max-w-md p-6 focus:outline-none'),
    /** Inner scrollable region for inside-scroll dialogs. */
    scrollBody: 'mt-4 max-h-[50vh] overflow-y-auto pr-2 text-sm text-muted-foreground',
    title: 'text-base font-semibold text-card-foreground',
    description: 'mt-1.5 text-sm text-muted-foreground',
    close: cn(demoButton.base, demoButton.ghost, 'absolute top-3 right-3 size-7 p-0'),
    field: 'mt-4 grid gap-1.5 text-sm font-medium text-foreground',
    footer: 'mt-6 flex justify-end gap-2'
} as const;

/**
 * Drawer parts: an edge-anchored sheet with swipe-to-dismiss.
 *
 * The popup's resting transform reads the swipe variables the engine writes
 * (`--drawer-swipe-movement-*`), initialised to `0px` here, with a snap-back transition that is
 * disabled while `[data-swiping]`. Compose `popup` with exactly one `side`.
 */
export const demoDrawer = {
    /**
     * A presence root must carry an exit keyframe for the close to be awaited before unmount; without
     * it the presence machine sees `animation-name: none` on every root and removes the drawer
     * instantly, skipping the popup's slide-out (the slide is a CSS *transition*, which the machine
     * does not wait for). This overlay-fade keyframe (sized to the 200ms slide-out) goes on the
     * backdrop for modal drawers, or on the popup itself when there is no backdrop (non-modal) — both
     * carry `data-state` (the drawer backdrop/popup compose the dialog backdrop/popup).
     */
    overlayAnimated: 'data-[state=open]:animate-drawer-overlay-in data-[state=closed]:animate-drawer-overlay-out',
    backdrop: 'fixed inset-0 z-50 bg-foreground/50',
    popup: cn(
        'fixed z-50 flex flex-col bg-card text-card-foreground shadow-lg focus:outline-none',
        '[--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px]',
        '[transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)]',
        '[transition:transform_300ms_ease,scale_300ms_ease,translate_300ms_ease] data-[swiping]:[transition:none]',
        // A parent drawer recedes behind the nested one: top-anchored so the scaled-down parent
        // lifts a few px above the child and peeks out (stacked-cards look).
        'origin-top data-[nested-drawer-open]:scale-[0.965] data-[nested-drawer-open]:-translate-y-3'
    ),
    side: {
        bottom: cn(
            'inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl border-t border-b-0 border-border',
            'after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-y))))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:ease after:content-[""] data-[swiping]:after:duration-0',
            'data-[state=open]:animate-drawer-in-bottom data-[state=closed]:animate-drawer-out-bottom'
        ),
        top: cn(
            'inset-x-0 top-0 max-h-[90vh] rounded-b-2xl border-b border-border',
            'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-full after:h-[calc(3rem+max(0px,var(--drawer-swipe-movement-y)))] after:border-0 after:bg-[inherit] after:transition-[height] after:duration-300 after:ease after:content-[""] data-[swiping]:after:duration-0',
            'data-[state=open]:animate-drawer-in-top data-[state=closed]:animate-drawer-out-top'
        ),
        left: cn(
            'inset-y-0 left-0 w-80 max-w-[90vw] rounded-r-2xl border-r border-border',
            'after:pointer-events-none after:absolute after:inset-y-0 after:right-full after:w-[calc(3rem+max(0px,var(--drawer-swipe-movement-x)))] after:border-0 after:bg-[inherit] after:transition-[width] after:duration-300 after:ease after:content-[""] data-[swiping]:after:duration-0',
            'data-[state=open]:animate-drawer-in-left data-[state=closed]:animate-drawer-out-left'
        ),
        right: cn(
            'inset-y-0 right-0 w-80 max-w-[90vw] rounded-l-2xl border-l border-border',
            'after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[calc(3rem+max(0px,calc(-1*var(--drawer-swipe-movement-x))))] after:border-0 after:bg-[inherit] after:transition-[width] after:duration-300 after:ease after:content-[""] data-[swiping]:after:duration-0',
            'data-[state=open]:animate-drawer-in-right data-[state=closed]:animate-drawer-out-right'
        )
    },
    /** Visual grab handle hinting the swipe gesture. */
    grip: 'mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted',
    body: 'overflow-y-auto p-6',
    title: 'text-base font-semibold text-card-foreground',
    description: 'mt-1.5 text-sm text-muted-foreground',
    footer: 'mt-6 flex justify-end gap-2',
    close: cn(demoButton.base, demoButton.ghost, 'absolute top-3 right-3 size-7 p-0'),
    /** Background content that scales back while any drawer is open (`rdxDrawerIndent*`). */
    indent: cn(
        'origin-top transition-[scale,border-radius] duration-300',
        'data-[active]:scale-[0.95] data-[active]:rounded-2xl data-[active]:overflow-hidden'
    )
} as const;

/**
 * Toast stack + parts. The headless primitive only writes the data/CSS-variable contract; these
 * classes turn it into a visible bottom-right stack that expands on hover and follows swipes.
 *
 * - `--toast-index` (0 = front) drives the collapsed peek (translate up + scale + fade).
 * - `data-expanded` (viewport hovered/focused) lays toasts out by their measured `--toast-offset-y`.
 * - `--toast-swipe-movement-x/y` + `data-swiping` move the inner content live during a swipe.
 * - `data-[state]` runs the enter/leave keyframes; the leave keyframe is required for the toast to
 *   unmount (the primitive removes it on `animationend`).
 */
export const demoToast = {
    viewport: cn(
        'fixed right-4 bottom-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] outline-none',
        '[--toast-gap:0.75rem]'
    ),
    root: cn(
        'group absolute right-0 bottom-0 w-full origin-bottom',
        '[z-index:calc(50-var(--toast-index))]',
        '[opacity:calc(1-var(--toast-index)*0.3)] data-[expanded]:opacity-100 data-[front]:opacity-100',
        '[transform:translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-var(--toast-index)*0.05))]',
        'data-[expanded]:[transform:translateY(calc((var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))*-1))]',
        '[transition:transform_320ms_cubic-bezier(0.22,1,0.36,1),opacity_320ms_ease]',
        'data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out'
    ),
    content: cn(
        demoCard,
        'relative flex items-start gap-3 p-4 pr-9 shadow-lg',
        '[transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)]',
        '[transition:transform_220ms_ease] group-data-[swiping]:[transition:none]'
    ),
    icon: 'mt-0.5 size-5 shrink-0',
    title: 'text-sm font-semibold text-card-foreground',
    description: 'mt-1 text-sm text-muted-foreground',
    close: cn(demoButton.base, demoButton.ghost, 'absolute top-2 right-2 size-6 p-0'),
    action: cn(demoButton.base, demoButton.outline, demoButton.size.sm, 'mt-3'),
    /** Top-center placement variant: the stack grows downward (signs flipped, anchored at the top). */
    viewportTop: cn(
        'fixed top-4 left-1/2 z-50 w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2 outline-none',
        '[--toast-gap:0.75rem]'
    ),
    rootTop: cn(
        'group absolute top-0 left-0 w-full origin-top',
        '[z-index:calc(50-var(--toast-index))]',
        '[opacity:calc(1-var(--toast-index)*0.3)] data-[expanded]:opacity-100 data-[front]:opacity-100',
        '[transform:translateY(calc(var(--toast-index)*0.75rem))_scale(calc(1-var(--toast-index)*0.05))]',
        'data-[expanded]:[transform:translateY(calc(var(--toast-offset-y)+var(--toast-index)*var(--toast-gap)))]',
        '[transition:transform_320ms_cubic-bezier(0.22,1,0.36,1),opacity_320ms_ease]',
        'data-[state=open]:animate-toast-in-top data-[state=closed]:animate-toast-out-top'
    ),
    /**
     * Anchored variant: the toast is placed by `rdxToastPositioner` (popper), so it needs no stacking
     * transform — just a scale/fade keyed to `data-state`. Reuses the popover popup keyframes.
     */
    anchored: cn(
        'w-72 origin-[var(--toast-transform-origin)]',
        'data-[state=open]:animate-popover-popup-in data-[state=closed]:animate-popover-popup-out'
    )
} as const;

/**
 * Popover surfaces and parts.
 *
 * `popupAnimated` drives the popup's own zoom/slide via `data-state`; that exit animation is what the
 * presence machine waits for before unmounting (ADR 0011 — `getAnimations({ subtree: true })` sees
 * the popup even though the positioner is the structural `*rdxPopoverPortal` root). No positioner-level
 * "decoy" opacity keyframe is needed; the transparent positioner carries no exit animation of its own.
 */
export const demoPopover = {
    positioner: 'z-50',
    popup: cn(demoCard, 'relative w-80 p-4'),
    popupAnimated: 'data-[state=open]:animate-popover-popup-in data-[state=closed]:animate-popover-popup-out',
    backdrop: 'fixed inset-0 bg-foreground/10',
    arrow: demoArrow('text-card'),
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
        // The trigger is a real <button>, so a disabled item gives it the native `disabled`
        // attribute — style it with the `disabled:` variant, not `data-disabled`.
        'disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60 disabled:hover:bg-background'
    ),
    triggerH: '[writing-mode:vertical-rl] h-full px-0 py-5',
    content: cn(
        'overflow-hidden text-[15px] text-muted-foreground bg-muted',
        '[&[data-state=open][data-orientation=vertical]]:animate-accordion-down',
        '[&[data-state=closed][data-orientation=vertical]]:animate-accordion-up',
        '[&[data-state=open][data-orientation=horizontal]]:animate-accordion-right',
        '[&[data-state=closed][data-orientation=horizontal]]:animate-accordion-left',
        // Pin the *resting* closed size to 0. Without this, the moment the close
        // keyframe ends (it has no `forwards` fill) the height reverts to `auto`
        // for the frame before `hidden` is applied, making a switching accordion
        // jump. The running animation still wins while it plays, so the collapse
        // animation itself is unchanged.
        '[&[data-state=closed][data-orientation=vertical]]:h-0',
        '[&[data-state=closed][data-orientation=horizontal]]:w-0'
    ),
    contentText: 'px-5 py-4'
} as const;

/**
 * Navigation menu parts: a horizontal menubar of triggers/links sharing one popup.
 *
 * The popup wraps the {@link demoNavigationMenu.viewport}, which is sized from the active content via
 * the `--popup-width` / `--popup-height` variables set by the viewport and transitioned for the
 * morph effect. Content morphs between items via the `data-current` / `data-previous` attributes.
 */
export const demoNavigationMenu = {
    root: 'relative flex justify-center',
    list: cn(demoCard, 'flex list-none items-center gap-1 p-1'),
    trigger: cn(
        'flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground outline-none',
        'hover:bg-muted focus-visible:bg-muted data-[popup-open]:bg-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        demoFocusRing
    ),
    link: cn(
        'flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground no-underline outline-none',
        'hover:bg-muted focus-visible:bg-muted',
        demoFocusRing
    ),
    icon: 'size-3.5 transition-transform duration-200 data-[state=open]:rotate-180',
    positioner: 'z-50 data-[closed]:pointer-events-none',
    // The popup's own `data-ending-style` zoom (below) is the exit the presence machine waits for
    // (ADR 0011 — subtree-aware), so the positioner needs no opacity "decoy" keyframe.
    popup: cn(
        demoCard,
        'relative overflow-hidden p-0 origin-[var(--transform-origin)]',
        'data-[starting-style]:animate-navigation-menu-popup-in data-[ending-style]:animate-navigation-menu-popup-out'
    ),
    arrow: demoArrow('text-card'),
    viewport: cn(
        // Size to the active content via the variables the viewport measures; fall back to
        // `max-content`/`auto` so the popup hugs its content before the first measurement instead of
        // a bare `var(--popup-width)` (which is invalid until set and would let the block fill the page).
        'relative block h-[var(--popup-height,auto)] w-[var(--popup-width,max-content)] overflow-hidden',
        'transition-[width,height] duration-200',
        '[&>[data-current]]:animate-navigation-menu-content-in',
        '[&>[data-previous]]:absolute [&>[data-previous]]:inset-0 [&>[data-previous]]:animate-navigation-menu-content-out'
    ),
    content: 'p-4',
    contentGrid: 'grid gap-2',
    cardLink: cn(
        'block select-none rounded-md p-3 no-underline outline-none transition-colors',
        'hover:bg-muted focus-visible:bg-muted',
        demoFocusRing
    ),
    cardHeading: 'mb-1 text-sm font-medium text-foreground',
    cardText: 'text-sm leading-snug text-muted-foreground'
} as const;

/** Tooltip parts: a small popup anchored to a trigger. */
export const demoTooltip = {
    positioner: 'z-50',
    popup: 'border-border bg-popover text-popover-foreground relative max-w-72 select-none rounded-md border px-3 py-1.5 text-sm',
    arrow: demoArrow('text-popover')
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
    arrow: demoArrow('text-popover')
} as const;

/**
 * Image cropper. The root clips an oversized, draggable image; the crop area is a fixed window with a
 * white frame and a dark mask (the classic cropper look) punched out by a huge spread box-shadow.
 * `group` on the root lets the crop area show a focus ring when the widget is keyboard-focused.
 */
export const demoCropper = {
    root: cn(
        'group relative flex h-[280px] w-[500px] max-w-full items-center justify-center overflow-hidden rounded-lg',
        'cursor-move touch-none outline-none',
        'data-[disabled]:cursor-default data-[disabled]:opacity-60'
    ),
    image: 'pointer-events-none size-full object-cover',
    cropArea: cn(
        'pointer-events-none absolute border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]',
        'group-focus-visible:shadow-[0_0_0_9999px_rgba(0,0,0,0.4),0_0_0_3px_rgba(255,255,255,0.5)]'
    ),
    output: 'mt-2 max-w-full overflow-auto rounded-md bg-muted p-2 text-sm whitespace-pre text-muted-foreground'
} as const;

/**
 * Combobox (filterable select). The control is a bordered box wrapping the input and trigger; the
 * popup is a card-like listbox. Item highlight is virtual (`data-highlighted`, driven by keyboard /
 * hover) rather than `:focus`, and selection shows via `data-selected`.
 */
export const demoCombobox = {
    /**
     * The control is `relative` and the **input fills it**; the trigger / clear buttons are absolutely
     * positioned on top. This keeps the input (the popper anchor) the same box as the visible control,
     * so the popup aligns to the control edges.
     */
    control: cn(
        'relative inline-flex h-9 w-64 items-center rounded-md border border-border bg-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        'data-[disabled]:opacity-50'
    ),
    input: cn(
        'h-full w-full rounded-md bg-transparent pl-3 pr-9 text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground'
    ),
    /** Inline input for `multiple` mode — flows on the same row as the chips and grows to fill. */
    inputInline: cn(
        'min-w-24 flex-1 bg-transparent text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground'
    ),
    trigger: cn(
        'absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm',
        'text-muted-foreground hover:text-foreground disabled:pointer-events-none'
    ),
    clear: cn(
        'absolute right-8 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm',
        'text-muted-foreground hover:text-foreground'
    ),
    /** Modal backdrop — `pointer-events-auto` so clicking it dismisses while the page is inert. */
    /** Transparent — just an invisible click-catcher so a click outside the popup dismisses while
     * the page is inert. Add a `bg-*` for a dimmed (dialog-like) modal instead. */
    backdrop: 'fixed inset-0 z-40 pointer-events-auto',
    // ADR 0012 §3: z-index belongs on the positioner (Base UI-aligned); the popper no longer copies
    // the popup's z onto it.
    positioner: 'z-50 w-64 data-[closed]:pointer-events-none',
    popup: cn(
        'mt-2 max-h-60 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[closed]:hidden'
    ),
    list: 'flex flex-col',
    item: cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'data-[highlighted]:bg-muted',
        'data-[selected]:font-medium',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    itemIndicator: 'absolute left-2 flex size-3.5 items-center justify-center',
    empty: 'py-6 text-center text-sm text-muted-foreground',
    groupLabel: 'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
    /** Select-like trigger for the "input inside the popup" pattern. */
    selectTrigger: cn(
        'inline-flex h-9 w-64 items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-sm',
        'text-foreground data-[placeholder]:text-muted-foreground hover:bg-muted',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none'
    ),
    /** Search header (input row) inside a popup. */
    searchHeader: 'border-b border-border p-1',
    popupInput: cn(
        'h-8 w-full rounded-sm bg-transparent px-2 text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground'
    ),
    /** Chips for multiple mode. */
    // `display: contents` so the chips become flex items of the control itself — the input then flows
    // inline right after the last chip (wrapping only when it truly doesn't fit), instead of being
    // pushed below the whole chips block.
    chips: 'contents',
    chip: 'inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground',
    chipRemove: 'inline-flex size-3.5 items-center justify-center rounded-full hover:bg-border'
} as const;
