# Drawer

#### An edge-anchored sheet that opens over the page and dismisses with a swipe.

Drawer builds on the declarative Dialog: it composes the same Portal, Presence, Dismissable Layer,
Focus Scope, and scroll-lock behavior, then layers a headless swipe-to-dismiss gesture on top. It is
modal by default but, unlike Alert Dialog, leaves modality and dismissal fully configurable. Styling
and native CSS animations belong to the consumer.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-default',
    imports: [...drawerImports, LucideX],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open drawer</button>

            <ng-template rdxDrawerPortal>
                <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                    <div [class]="d.grip" aria-hidden="true"></div>

                    <div [class]="d.body" rdxDrawerContent>
                        <h2 [class]="d.title" rdxDrawerTitle>Drag me down</h2>
                        <p [class]="d.description" rdxDrawerDescription>
                            Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point
                            snaps it back.
                        </p>

                        <p class="text-muted-foreground mt-4 text-sm">
                            The grab handle above is purely visual — the whole panel is draggable. Scrollable regions
                            yield to scrolling until they reach their edge.
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Cancel</button>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Confirm</button>
                        </div>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDrawerClose>
                        <svg aria-hidden="true" lucideX size="16"></svg>
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```

## Features

- ✅ Reuses the Dialog primitive: trigger, portal, presence, backdrop, viewport, title, description, close.
- ✅ Modal by default, but `[modal]` (`true | false | 'trap-focus'`) and `disablePointerDismissal` stay user-overridable.
- ✅ Swipe-to-dismiss in any direction via `[swipeDirection]` (`'up' | 'down' | 'left' | 'right'`).
- ✅ Headless gesture contract: `--drawer-swipe-movement-x/y`, `--drawer-swipe-strength`, `[data-swiping]`, `[data-swipe-direction]`, `[data-swipe-dismiss]`.
- ✅ Rubber-band resistance when dragging against the dismiss direction; velocity- or distance-based release.
- ✅ Yields to scrollable regions inside `rdxDrawerContent` until they reach their edge; opt out with `data-base-ui-swipe-ignore`.
- ✅ Swipe-to-open from an off-canvas `rdxDrawerSwipeArea` strip.
- ✅ Snap points (`[snapPoints]`, `[(snapPoint)]`, `[defaultSnapPoint]`, `[snapToSequentialPoints]`) with velocity skipping and `data-expanded`.
- ✅ Nested drawers (detected through the dialog hierarchy): the parent gains `data-nested-drawer-open` / `--nested-drawers`.
- ✅ Optional `rdxDrawerProvider` + `rdxDrawerIndent` / `rdxDrawerIndentBackground` for an app-wide page-scale effect.
- ✅ Exposes swipe progress on the backdrop with `--drawer-swipe-progress` for a gesture-linked fade.
- ✅ Supports two-way `[(open)]`, `defaultOpen`, multiple triggers, controlled `triggerId`, and detached triggers via a shared handle.
- ✅ Closes on Escape, swipe, outside pointer interaction, or an explicit close button, and reports the reason on `onOpenChange`.

## Import

```typescript
import {
    createRdxDrawerHandle,
    provideRdxDrawerProvider,
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerIndent,
    RdxDrawerIndentBackground,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerProviderDirective,
    RdxDrawerRoot,
    RdxDrawerSwipeArea,
    RdxDrawerTitle,
    RdxDrawerTrigger,
    RdxDrawerViewport
} from '@radix-ng/primitives/drawer';
```

Or import all parts through the module:

```typescript
import { RdxDrawerModule } from '@radix-ng/primitives/drawer';
```

The `drawerImports` array re-exports every part for standalone `imports`.

## Anatomy

Apply the parts to your own markup. `rdxDrawerPortal` is a **structural** directive: it teleports the
backdrop and popup into `document.body` while the drawer is open and waits for the closed-state CSS
exit keyframes on every root element before unmounting. At least one root **must** have a
`data-[state=closed]` `@keyframes` exit animation, otherwise presence sees no animation on the roots
and unmounts the drawer instantly, skipping the slide-out (the popup's slide is a CSS _transition_,
which presence does not wait for). Give the backdrop an overlay fade sized to at least the popup's
slide duration:

```css
[rdxDrawerBackdrop][data-state='open'] {
    animation: overlay-in 250ms ease-out;
}
[rdxDrawerBackdrop][data-state='closed'] {
    animation: overlay-out 200ms ease-in forwards;
}
```

For a non-modal drawer (no backdrop) put the overlay-fade keyframe on the popup instead — it carries
`data-state` too.

The popup's resting transform should read the swipe variables so the gesture and snap-back are visible,
and its slide-out keyframe should hold the closed position with `forwards`:

```css
[rdxDrawerPopup] {
    transform: translate3d(var(--drawer-swipe-movement-x, 0), var(--drawer-swipe-movement-y, 0), 0);
    transition: transform 0.3s ease;
}
[rdxDrawerPopup][data-swiping] {
    transition: none;
}
[rdxDrawerPopup][data-state='closed'] {
    animation: slide-out-bottom 200ms ease-in forwards;
}
```

```html
<div rdxDrawerRoot>
    <button rdxDrawerTrigger>Open</button>

    <ng-template rdxDrawerPortal>
        <div rdxDrawerBackdrop></div>
        <div rdxDrawerPopup>
            <h2 rdxDrawerTitle>Title</h2>
            <p rdxDrawerDescription>Description</p>
            <div rdxDrawerContent>…scrollable body…</div>
            <button rdxDrawerClose>Close</button>
        </div>
    </ng-template>
</div>
```

## Examples

### Default

A bottom sheet you can swipe down to dismiss, with an accessible title, description, and close buttons.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-default',
    imports: [...drawerImports, LucideX],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open drawer</button>

            <ng-template rdxDrawerPortal>
                <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                    <div [class]="d.grip" aria-hidden="true"></div>

                    <div [class]="d.body" rdxDrawerContent>
                        <h2 [class]="d.title" rdxDrawerTitle>Drag me down</h2>
                        <p [class]="d.description" rdxDrawerDescription>
                            Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point
                            snaps it back.
                        </p>

                        <p class="text-muted-foreground mt-4 text-sm">
                            The grab handle above is purely visual — the whole panel is draggable. Scrollable regions
                            yield to scrolling until they reach their edge.
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Cancel</button>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Confirm</button>
                        </div>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDrawerClose>
                        <svg aria-hidden="true" lucideX size="16"></svg>
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```

### State

Own the open state with `[(open)]` and drive it from anywhere — buttons outside the drawer open and
close it alongside the trigger.

```typescript
import { Component, signal } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-controlled',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Drawer is {{ open() ? 'open' : 'closed' }}</p>

            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>

            <div [(open)]="open" rdxDrawerRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open drawer</button>

                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Controlled drawer</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                The open state is owned by the component and bound with
                                <code>[(open)]</code>
                                .
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="open.set(false)">
                                    Close from outside
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly open = signal(false);
}
```

### Position

Set `[swipeDirection]` and position the popup with CSS to anchor the drawer to any edge. The direction
controls the dismiss gesture; the visual side is consumer CSS.

```typescript
import { Component } from '@angular/core';
import { drawerImports, RdxDrawerSwipeDirection } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

const SIDES: RdxDrawerSwipeDirection[] = ['top', 'right', 'bottom', 'left'];

@Component({
    selector: 'rdx-drawer-sides',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-wrap gap-3">
            @for (side of sides; track side) {
                <div [swipeDirection]="side" rdxDrawerRoot>
                    <button [class]="cn(b.base, b.outline, b.size.md, 'capitalize')" rdxDrawerTrigger>
                        {{ side }}
                    </button>

                    <ng-template rdxDrawerPortal>
                        <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                        <div [class]="cn(d.popup, d.side[side])" rdxDrawerPopup>
                            <div [class]="d.body" rdxDrawerContent>
                                <h2 [class]="cn(d.title, 'capitalize')" rdxDrawerTitle>{{ side }} drawer</h2>
                                <p [class]="d.description" rdxDrawerDescription>
                                    Swipe toward the {{ side }} edge to dismiss.
                                </p>

                                <div [class]="d.footer">
                                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Done</button>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </div>
            }
        </div>
    `
})
export class RdxDrawerSidesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly sides = SIDES;
}
```

### Snap points

Pass `[snapPoints]` (fractions `0–1`, pixel numbers, or strings like `'160px'`, `'30rem'`, `'40%'`,
ordered ascending by openness) to let the drawer rest at intermediate heights. Bind `[(snapPoint)]` to
read or drive the active point; a fast flick skips points and dragging past the lowest one dismisses.
The popup gains `data-expanded` at the most open point and exposes `--drawer-snap-point-offset` /
`--drawer-height`. This example mirrors Base UI's compact `31rem` peek and near full-height snap
points, with a fixed drag header and independently scrollable content. Add `[snapToSequentialPoints]`
to step one point per release instead of skipping.

```typescript
import { Component } from '@angular/core';
import { drawerImports, RdxDrawerSnapPoint } from '@radix-ng/primitives/drawer';
import { cn, demoButton } from '../../storybook/styles';

const TOP_MARGIN_REM = 1;
const VISIBLE_SNAP_POINTS_REM = [30];

function toViewportSnapPoint(heightRem: number): RdxDrawerSnapPoint {
    return `${heightRem + TOP_MARGIN_REM}rem`;
}

@Component({
    selector: 'rdx-drawer-snap-points',
    imports: [...drawerImports],
    template: `
        <div [snapPoints]="snapPoints" rdxDrawerRoot>
            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerTrigger>Open snap drawer</button>

            <ng-template rdxDrawerPortal>
                <div
                    class="bg-foreground/20 fixed inset-0 min-h-dvh opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                    rdxDrawerBackdrop
                ></div>

                <div class="fixed inset-0 flex touch-none items-end justify-center" rdxDrawerViewport>
                    <div
                        class="border-border bg-card text-card-foreground relative flex h-[calc(100dvh-var(--top-margin))] min-h-0 w-full [transform:translateY(var(--drawer-swipe-movement-y))] touch-none flex-col overflow-visible border-t shadow-lg outline-none [--bleed:3rem] [--top-margin:1rem] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[var(--bleed)] after:bg-[inherit] after:content-[''] data-[ending-style]:[transform:translateY(calc(100%+2px))] data-[starting-style]:[transform:translateY(calc(100%+2px))] data-[swiping]:select-none data-[swiping]:[transition:none]"
                        rdxDrawerPopup
                    >
                        <div class="border-border shrink-0 touch-none border-b px-6 pt-3.5 pb-4">
                            <div class="bg-muted mx-auto mb-2.5 h-1 w-12 shrink-0"></div>
                            <h2 class="cursor-default text-center text-base font-bold" rdxDrawerTitle>Snap points</h2>
                        </div>

                        <div
                            class="min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
                            rdxDrawerContent
                        >
                            <div class="mx-auto w-full max-w-90">
                                <p class="text-muted-foreground mb-4 text-center text-sm" rdxDrawerDescription>
                                    Drag the sheet to snap between a compact peek and a near full-height view.
                                </p>

                                <div class="mb-6 grid gap-3" aria-hidden="true">
                                    @for (item of items; track item) {
                                        <div class="bg-muted h-12"></div>
                                    }
                                </div>

                                <div class="flex items-center justify-end gap-3">
                                    <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerSnapPointsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly snapPoints: RdxDrawerSnapPoint[] = [...VISIBLE_SNAP_POINTS_REM.map(toViewportSnapPoint), 1];
    protected readonly items = Array.from({ length: 20 }, (_, index) => index);
}
```

### Swipe to open

An off-canvas `rdxDrawerSwipeArea` strip reveals the drawer as the pointer moves, then settles it
open or closed on release. This example mirrors
Base UI's right-edge swipe-area demo: the non-modal drawer portals back into a local,
`overflow-hidden` container and uses `rdxDrawerViewport` to position the popup inside it.

```typescript
import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-swipe-to-open',
    imports: [...drawerImports],
    template: `
        <div
            class="border-border bg-background text-foreground relative min-h-80 w-full max-w-2xl overflow-hidden border"
            #portalContainer
        >
            <div [modal]="false" swipeDirection="right" rdxDrawerRoot>
                <div
                    class="border-primary bg-primary/10 absolute inset-y-0 right-0 z-[1] w-10 cursor-grab border-l-2 border-dashed data-[swiping]:cursor-grabbing"
                    rdxDrawerSwipeArea
                >
                    <span
                        class="text-primary pointer-events-none absolute top-1/2 right-0 z-0 mr-2 origin-center -translate-y-1/2 -rotate-90 text-xs font-bold tracking-[0.12em] whitespace-nowrap uppercase"
                    >
                        Swipe here
                    </span>
                </div>

                <div class="flex min-h-80 flex-col items-center justify-center gap-3 p-4 pr-16 text-center">
                    <p class="text-muted-foreground text-sm">Swipe from the right edge to open the drawer.</p>
                </div>

                <ng-template [container]="portalContainer" rdxDrawerPortal>
                    <div
                        [class]="
                            cn(
                                'bg-foreground/20 absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))]',
                                'transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
                                'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0'
                            )
                        "
                        rdxDrawerBackdrop
                    ></div>

                    <div class="absolute inset-0 z-20 flex items-stretch justify-end" rdxDrawerViewport>
                        <div
                            class="border-border bg-card text-card-foreground h-full w-80 max-w-[calc(100%-3rem)] [transform:translateX(var(--drawer-swipe-movement-x))] overflow-y-auto border-l p-6 shadow-lg outline-none [--drawer-swipe-movement-x:0px] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:[transform:translateX(100%)] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:select-none data-[swiping]:[transition:none]"
                            rdxDrawerPopup
                        >
                            <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                <h2 [class]="d.title" rdxDrawerTitle>Library</h2>
                                <p [class]="d.description" rdxDrawerDescription>
                                    Swipe from the edge whenever you want to jump back into your playlists.
                                </p>
                                <div [class]="d.footer">
                                    <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerSwipeToOpenComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```

### Mobile navigation

A taller sheet whose body scrolls. The swipe gesture yields to scrolling inside `rdxDrawerContent`
until the scroll reaches its edge, so the drawer only swipes away from the top of the list.

```typescript
import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';
import { cn, demoButton, demoCard, demoDrawer, demoFocusRing } from '../../storybook/styles';

const ITEMS = [
    { href: '/react/overview', label: 'Overview' },
    { href: '/react/components', label: 'Components' },
    { href: '/react/utils', label: 'Utilities' },
    { href: '/react/overview/releases', label: 'Releases' }
] as const;

const LONG_LIST = [
    { href: '/react/components/accordion', label: 'Accordion' },
    { href: '/react/components/alert-dialog', label: 'Alert Dialog' },
    { href: '/react/components/autocomplete', label: 'Autocomplete' },
    { href: '/react/components/avatar', label: 'Avatar' },
    { href: '/react/components/button', label: 'Button' },
    { href: '/react/components/checkbox', label: 'Checkbox' },
    { href: '/react/components/checkbox-group', label: 'Checkbox Group' },
    { href: '/react/components/collapsible', label: 'Collapsible' },
    { href: '/react/components/combobox', label: 'Combobox' },
    { href: '/react/components/context-menu', label: 'Context Menu' },
    { href: '/react/components/dialog', label: 'Dialog' },
    { href: '/react/components/drawer', label: 'Drawer' },
    { href: '/react/components/field', label: 'Field' },
    { href: '/react/components/fieldset', label: 'Fieldset' },
    { href: '/react/components/form', label: 'Form' },
    { href: '/react/components/input', label: 'Input' },
    { href: '/react/components/menu', label: 'Menu' },
    { href: '/react/components/menubar', label: 'Menubar' },
    { href: '/react/components/meter', label: 'Meter' },
    { href: '/react/components/navigation-menu', label: 'Navigation Menu' },
    { href: '/react/components/number-field', label: 'Number Field' },
    { href: '/react/components/otp-field', label: 'OTP Field' },
    { href: '/react/components/popover', label: 'Popover' },
    { href: '/react/components/preview-card', label: 'Preview Card' },
    { href: '/react/components/progress', label: 'Progress' },
    { href: '/react/components/radio', label: 'Radio' },
    { href: '/react/components/scroll-area', label: 'Scroll Area' },
    { href: '/react/components/select', label: 'Select' },
    { href: '/react/components/separator', label: 'Separator' },
    { href: '/react/components/slider', label: 'Slider' },
    { href: '/react/components/switch', label: 'Switch' },
    { href: '/react/components/tabs', label: 'Tabs' },
    { href: '/react/components/toast', label: 'Toast' },
    { href: '/react/components/toggle', label: 'Toggle' },
    { href: '/react/components/toggle-group', label: 'Toggle Group' },
    { href: '/react/components/toolbar', label: 'Toolbar' },
    { href: '/react/components/tooltip', label: 'Tooltip' }
] as const;

@Component({
    selector: 'rdx-drawer-scrollable',
    imports: [
        ...drawerImports,
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb
    ],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, 'h-8 px-3 text-sm leading-none font-normal')" rdxDrawerTrigger>
                Open mobile menu
            </button>

            <ng-template rdxDrawerPortal>
                <div
                    [class]="cn(d.backdrop, d.overlayAnimated, 'opacity-[calc(1-var(--drawer-swipe-progress))]')"
                    rdxDrawerBackdrop
                ></div>

                <div class="group fixed inset-0 z-50" rdxDrawerViewport>
                    <div class="pointer-events-auto h-full overscroll-contain" rdxScrollAreaRoot>
                        <div class="h-full touch-auto overscroll-contain" rdxScrollAreaViewport>
                            <div
                                class="flex min-h-full items-end justify-center pt-8 min-[42rem]:px-16 min-[42rem]:py-16"
                                rdxScrollAreaContent
                            >
                                <div
                                    [class]="
                                        cn(
                                            card,
                                            'data-[state=open]:animate-drawer-in-bottom data-[state=closed]:animate-drawer-out-bottom',
                                            'w-full max-w-[42rem] rounded-t-2xl rounded-b-none border-x-0 border-b-0',
                                            '[--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px]',
                                            '[transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)]',
                                            'transition-transform duration-300 outline-none data-[swiping]:transition-none',
                                            'min-[42rem]:rounded-2xl min-[42rem]:border'
                                        )
                                    "
                                    rdxDrawerPopup
                                >
                                    <nav class="relative flex flex-col px-6 pt-4 pb-6" aria-label="Navigation">
                                        <div class="grid grid-cols-[1fr_auto_1fr] items-start">
                                            <svg class="h-9 w-9" aria-hidden="true" />
                                            <div class="bg-muted h-1.5 w-12 justify-self-center rounded-full"></div>
                                            <button
                                                [class]="cn(b.base, b.ghost, 'h-8 w-8 justify-self-end p-0')"
                                                aria-label="Close menu"
                                                rdxDrawerClose
                                            >
                                                <svg
                                                    class="block"
                                                    aria-hidden="true"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-linecap="square"
                                                    stroke-linejoin="round"
                                                >
                                                    <path d="m2.5 2.5 11 11m-11 0 11-11" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div class="w-full" rdxDrawerContent>
                                            <h2 [class]="cn(d.title, 'm-0 mb-1')" rdxDrawerTitle>Menu</h2>
                                            <p [class]="cn(d.description, 'm-0 mb-5')" rdxDrawerDescription>
                                                Scroll the long list. Flick down from the top to dismiss.
                                            </p>

                                            <div class="pb-8">
                                                <ul class="m-0 grid list-none gap-1 p-0">
                                                    @for (item of items; track item.label) {
                                                        <li class="flex">
                                                            <a [class]="link" [href]="item.href">
                                                                {{ item.label }}
                                                            </a>
                                                        </li>
                                                    }
                                                </ul>

                                                <ul
                                                    class="m-0 mt-6 grid list-none gap-1 p-0"
                                                    aria-label="Component links"
                                                >
                                                    @for (item of longList; track item.label) {
                                                        <li class="flex">
                                                            <a [class]="link" [href]="item.href">
                                                                {{ item.label }}
                                                            </a>
                                                        </li>
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-foreground/10 pointer-events-none m-px flex w-4 touch-none justify-center opacity-0 transition-opacity duration-200 hover:pointer-events-auto hover:opacity-100 hover:duration-75 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-75"
                            rdxScrollAreaScrollbar
                            orientation="vertical"
                        >
                            <div class="bg-foreground/50 w-full rounded-full" rdxScrollAreaThumb></div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerScrollableComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly card = demoCard;
    protected readonly d = demoDrawer;
    protected readonly items = ITEMS;
    protected readonly longList = LONG_LIST;
    protected readonly link = cn(
        demoCard,
        demoFocusRing,
        'text-foreground hover:bg-muted active:bg-muted flex h-12 w-full items-center px-4 text-sm no-underline shadow-none transition-colors'
    );
}
```

### Non-modal

Set `[modal]="false"` to keep page scrolling and outside pointer interactions available while the
drawer is open; there is no backdrop in this mode.

```typescript
import { Component, signal } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-non-modal',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the drawer is open, and
                there is no backdrop.
            </p>

            <div [modal]="false" rdxDrawerRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open non-modal drawer</button>

                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.popup, d.side.bottom, d.overlayAnimated)" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Non-modal drawer</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                Keep interacting with the rest of the page; the counter below still works.
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDrawerNonModalComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly outsideClicks = signal(0);
}
```

### Action sheet with separate destructive action

An iOS-style action sheet: grouped actions with a separated destructive action and a cancel button,
each closing the drawer.

```typescript
import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

/** A full-width action-sheet row. */
const action = cn(
    'block w-full px-4 py-3 text-center text-sm text-foreground',
    'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
);

@Component({
    selector: 'rdx-drawer-action-sheet',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Photo options</button>

            <ng-template rdxDrawerPortal>
                <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                    <div [class]="d.grip" aria-hidden="true"></div>

                    <div class="overflow-y-auto pb-2" rdxDrawerContent>
                        <h2 class="sr-only" rdxDrawerTitle>Photo options</h2>
                        <p class="text-muted-foreground px-6 py-3 text-center text-xs" rdxDrawerDescription>
                            Choose an action for this photo
                        </p>

                        <!-- Primary group of actions. -->
                        <div class="divide-border border-border flex flex-col divide-y border-y">
                            <button [class]="action" rdxDrawerClose>Save to Photos</button>
                            <button [class]="action" rdxDrawerClose>Copy Link</button>
                            <button [class]="action" rdxDrawerClose>Add to Album</button>
                        </div>

                        <!-- Destructive action, set apart by a full-bleed spacer. -->
                        <div class="bg-muted h-2" aria-hidden="true"></div>
                        <button
                            [class]="cn(action, 'border-border text-destructive border-b font-medium')"
                            rdxDrawerClose
                        >
                            Delete Photo
                        </button>

                        <div class="bg-muted h-2" aria-hidden="true"></div>
                        <button [class]="cn(action, 'font-semibold')" rdxDrawerClose>Cancel</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerActionSheetComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly action = action;
}
```

### Nested drawers

Drawers stack on top of each other — each level's content hosts the trigger for the next. Nesting is
detected through the dialog hierarchy, so every parent gains `data-nested-drawer-open` (and
`--nested-drawers`) and recedes behind the one in front.

```typescript
import { Component, input } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

/**
 * A self-recursive drawer: each level's content hosts the trigger for the next level, so drawers
 * stack on top of each other. Nesting is detected through the dialog hierarchy, so every parent
 * gains `data-nested-drawer-open` and recedes behind the one in front (see `demoDrawer.popup`).
 */
@Component({
    selector: 'rdx-drawer-nested',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, level() === 1 ? b.primary : b.outline, b.size.md)" rdxDrawerTrigger>
                {{ level() === 1 ? 'Open drawer' : 'Open drawer ' + level() }}
            </button>

            <ng-template rdxDrawerPortal>
                <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                    <div [class]="d.grip" aria-hidden="true"></div>

                    <div [class]="d.body" rdxDrawerContent>
                        <h2 [class]="d.title" rdxDrawerTitle>Drawer level {{ level() }}</h2>
                        <p [class]="d.description" rdxDrawerDescription>
                            @if (level() < max()) {
                                Open another to stack it on top — this one scales back and peeks behind it.
                            } @else {
                                Deepest level. Swipe down or press Escape to peel the stack back one at a time.
                            }
                        </p>

                        <div [class]="d.footer">
                            @if (level() < max()) {
                                <rdx-drawer-nested [level]="level() + 1" [max]="max()" />
                            }
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>Close</button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerNestedComponent {
    /** Current depth (1 = the root drawer). */
    readonly level = input(1);
    /** How many levels can be stacked. */
    readonly max = input(4);

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```

### Indent effect

Wrap content in `rdxDrawerProvider` (or call `provideRdxDrawerProvider()` at the app root) and mark a
background layer with `rdxDrawerIndentBackground` and the foreground page with `rdxDrawerIndent`.
Both gain `[data-active]`, `--drawer-swipe-progress`, `--nested-drawers`, and
`--drawer-frontmost-height` while any drawer is open, so the page-scale effect follows the closing
gesture.

```typescript
import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-page-scale',
    imports: [...drawerImports],
    template: `
        <div class="w-full" rdxDrawerProvider>
            <div class="relative w-full overflow-hidden [--bleed:3rem]" #portalContainer>
                <div class="bg-foreground absolute inset-0" rdxDrawerIndentBackground></div>

                <div
                    class="border-border bg-background text-foreground relative min-h-80 origin-top [transform:scale(1)_translateY(0)] border p-4 [transition-duration:calc(400ms*var(--indent-transition)),calc(250ms*var(--indent-transition))] will-change-transform [--indent-radius:calc(1rem*(1-var(--drawer-swipe-progress)))] [--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))] [transition:transform_400ms_cubic-bezier(0.32,0.72,0,1),border-radius_250ms_cubic-bezier(0.32,0.72,0,1)] data-[active]:[transform:scale(calc(0.98+(0.02*var(--drawer-swipe-progress))))_translateY(calc(0.5rem*(1-var(--drawer-swipe-progress))))] data-[active]:rounded-tl-[var(--indent-radius)] data-[active]:rounded-tr-[var(--indent-radius)]"
                    rdxDrawerIndent
                >
                    <div class="flex min-h-80 items-center justify-center">
                        <div [modal]="false" rdxDrawerRoot>
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerTrigger>Open drawer</button>

                            <ng-template [container]="portalContainer" rdxDrawerPortal>
                                <div
                                    class="bg-foreground/20 absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                                    rdxDrawerBackdrop
                                ></div>

                                <div class="absolute inset-0 z-20 flex items-end justify-center" rdxDrawerViewport>
                                    <div
                                        class="border-border bg-card text-card-foreground -mb-[var(--bleed)] max-h-[calc(80vh+var(--bleed))] w-full [transform:translateY(var(--drawer-swipe-movement-y))] overflow-y-auto overscroll-contain border-t px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))] shadow-lg outline-none [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[starting-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[swiping]:select-none data-[swiping]:[transition:none]"
                                        rdxDrawerPopup
                                    >
                                        <div class="bg-muted mx-auto mb-4 h-1 w-12"></div>
                                        <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                            <h2 class="text-center" [class]="cn(d.title, 'text-center')" rdxDrawerTitle>
                                                Notifications
                                            </h2>
                                            <p [class]="cn(d.description, 'mb-6 text-center')" rdxDrawerDescription>
                                                You are all caught up. Good job!
                                            </p>
                                            <div class="flex justify-center gap-3">
                                                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ng-template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RdxDrawerPageScaleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```

### Detached triggers

Create a shared handle with `createRdxDrawerHandle()` when triggers live outside `rdxDrawerRoot`. The
handle also supports imperative `open(id)`, `toggle(id)`, and `close()`.

```typescript
import { Component } from '@angular/core';
import { createRdxDrawerHandle, drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-detached',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button id="cart" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDrawerTrigger>
                    Cart
                </button>
                <button id="account" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDrawerTrigger>
                    Account
                </button>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('account')">
                Open account imperatively
            </button>

            <div [handle]="handle" rdxDrawerRoot>
                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.right)" rdxDrawerPopup>
                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Detached triggers</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                The triggers and this drawer are connected with
                                <code>createRdxDrawerHandle()</code>
                                rather than DOM nesting.
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly handle = createRdxDrawerHandle();
}
```

## API Reference

### Root

`RdxDrawerRoot` composes `RdxDialogRoot` (proxying `[open]`, `[defaultOpen]`, `[modal]`,
`[disablePointerDismissal]`, `[handle]`, `[triggerId]`) and adds `[swipeDirection]`. Open-state outputs
`onOpenChange` / `onOpenChangeComplete` come from the dialog.

### Popup

`RdxDrawerPopup` composes the dialog popup (focus trap, dismissal, scroll lock, a11y) and owns the
swipe gesture. It exposes the dialog popup's dismissal and focus events and reads everything else from
context.

### SwipeArea

`RdxDrawerSwipeArea` opens the drawer when swiped inward from a screen edge.

### Provider, Indent, and IndentBackground

`rdxDrawerProvider` hosts the optional app-level coordinator (also available as
`provideRdxDrawerProvider()`). `rdxDrawerIndent` and `rdxDrawerIndentBackground` read it and expose
`[data-active]`, `--drawer-swipe-progress`, `--nested-drawers`, and `--drawer-frontmost-height`; they
take no inputs.

### Trigger, Portal, Viewport, Backdrop, Content, Title, Description, and Close

These parts wrap their Dialog counterparts (or, for `Content`, mark the scrollable body) and read state
from context. See the Dialog docs for the trigger and portal inputs.
