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

      <ng-template rdxDrawerPortalPresence>
        <div [class]="d.portalAnimated" rdxDrawerPortal>
          <div [class]="d.backdrop" rdxDrawerBackdrop></div>

          <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
            <div [class]="d.grip" aria-hidden="true"></div>

            <div [class]="d.body" rdxDrawerContent>
              <h2 [class]="d.title" rdxDrawerTitle>Drag me down</h2>
              <p [class]="d.description" rdxDrawerDescription>
                Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point snaps it
                back.
              </p>

              <p class="text-muted-foreground mt-4 text-sm">
                The grab handle above is purely visual — the whole panel is draggable. Scrollable regions yield to
                scrolling until they reach their edge.
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
  RdxDrawerPortalPresence,
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

Apply the parts to your own markup. `rdxDrawerPortalPresence` manages mounting and waits for exit
keyframes on the first DOM element inside its template — the `rdxDrawerPortal`. That element **must**
have a `data-[state=closed]` exit animation, otherwise presence sees no animation on the root node and
unmounts the drawer instantly, skipping the slide-out. Give the portal an overlay fade (it also dims
the backdrop) sized to at least the popup's slide duration:

```css
[rdxDrawerPortal][data-state='open'] {
  animation: overlay-in 250ms ease-out;
}
[rdxDrawerPortal][data-state='closed'] {
  animation: overlay-out 200ms ease-in forwards;
}
```

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

  <ng-template rdxDrawerPortalPresence>
    <div rdxDrawerPortal>
      <div rdxDrawerBackdrop></div>
      <div rdxDrawerPopup>
        <h2 rdxDrawerTitle>Title</h2>
        <p rdxDrawerDescription>Description</p>
        <div rdxDrawerContent>…scrollable body…</div>
        <button rdxDrawerClose>Close</button>
      </div>
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

      <ng-template rdxDrawerPortalPresence>
        <div [class]="d.portalAnimated" rdxDrawerPortal>
          <div [class]="d.backdrop" rdxDrawerBackdrop></div>

          <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
            <div [class]="d.grip" aria-hidden="true"></div>

            <div [class]="d.body" rdxDrawerContent>
              <h2 [class]="d.title" rdxDrawerTitle>Drag me down</h2>
              <p [class]="d.description" rdxDrawerDescription>
                Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point snaps it
                back.
              </p>

              <p class="text-muted-foreground mt-4 text-sm">
                The grab handle above is purely visual — the whole panel is draggable. Scrollable regions yield to
                scrolling until they reach their edge.
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

        <ng-template rdxDrawerPortalPresence>
          <div [class]="d.portalAnimated" rdxDrawerPortal>
            <div [class]="d.backdrop" rdxDrawerBackdrop></div>

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

          <ng-template rdxDrawerPortalPresence>
            <div [class]="d.portalAnimated" rdxDrawerPortal>
              <div [class]="d.backdrop" rdxDrawerBackdrop></div>

              <div [class]="cn(d.popup, d.side[side])" rdxDrawerPopup>
                <div [class]="d.body" rdxDrawerContent>
                  <h2 [class]="cn(d.title, 'capitalize')" rdxDrawerTitle>{{ side }} drawer</h2>
                  <p [class]="d.description" rdxDrawerDescription>Swipe toward the {{ side }} edge to dismiss.</p>

                  <div [class]="d.footer">
                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Done</button>
                  </div>
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
`--drawer-height`. Add `[snapToSequentialPoints]` to step one point per release instead of skipping.

```typescript
import { Component, signal } from '@angular/core';
import { drawerImports, RdxDrawerSnapPoint } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
  selector: 'rdx-drawer-snap-points',
  imports: [...drawerImports],
  template: `
    <div [(snapPoint)]="snap" [snapPoints]="snapPoints" rdxDrawerRoot>
      <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open snap drawer</button>

      <ng-template rdxDrawerPortalPresence>
        <div [class]="d.portalAnimated" rdxDrawerPortal>
          <div [class]="d.backdrop" rdxDrawerBackdrop></div>

          <div [class]="cn(d.popup, d.side.bottom, 'h-[85vh]')" rdxDrawerPopup>
            <div [class]="d.grip" aria-hidden="true"></div>

            <div class="text-muted-foreground px-6 pt-2 text-center text-xs font-medium">
              Active snap point: {{ snap() }}
            </div>

            <div [class]="d.body" rdxDrawerContent>
              <h2 [class]="d.title" rdxDrawerTitle>Snap points</h2>
              <p [class]="d.description" rdxDrawerDescription>
                Drag the sheet between {{ snapPoints.length }} resting positions. A fast flick skips points; dragging
                past the lowest one dismisses it.
              </p>

              <p class="text-muted-foreground mt-4 text-sm">
                The active snap point is two-way bound with
                <code>[(snapPoint)]</code>
                , so app state and the gesture stay in sync.
              </p>

              <div [class]="d.footer">
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="snap.set(1)">Expand</button>
                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
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
  protected readonly d = demoDrawer;
  protected readonly snapPoints: RdxDrawerSnapPoint[] = ['160px', 0.5, 1];
  protected readonly snap = signal<RdxDrawerSnapPoint | null>(null);
}
```

### Swipe to open

An off-canvas `rdxDrawerSwipeArea` strip opens the drawer when swiped inward.

```typescript
import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
  selector: 'rdx-drawer-swipe-to-open',
  imports: [...drawerImports],
  template: `
    <div class="border-border bg-muted/40 relative h-72 w-full max-w-md overflow-hidden rounded-xl border">
      <div rdxDrawerRoot>
        <p class="text-muted-foreground p-4 text-sm">
          Swipe up from the highlighted strip at the bottom to open the drawer (or use the button).
        </p>

        <button [class]="cn(b.base, b.outline, b.size.sm, 'ml-4')" rdxDrawerTrigger>Open</button>

        <!-- Edge strip: swiping inward opens the drawer. -->
        <div
          class="bg-primary/15 absolute inset-x-0 bottom-0 h-8 cursor-grab touch-none data-[swiping]:cursor-grabbing"
          rdxDrawerSwipeArea
        ></div>

        <ng-template rdxDrawerPortalPresence>
          <div [class]="d.portalAnimated" rdxDrawerPortal>
            <div [class]="d.backdrop" rdxDrawerBackdrop></div>

            <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
              <div [class]="d.grip" aria-hidden="true"></div>
              <div [class]="d.body" rdxDrawerContent>
                <h2 [class]="d.title" rdxDrawerTitle>Opened by swipe</h2>
                <p [class]="d.description" rdxDrawerDescription>Swipe back down to dismiss.</p>
                <div [class]="d.footer">
                  <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
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
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

const LINKS = [
  'Home',
  'Discover',
  'Library',
  'Downloads',
  'Playlists',
  'Artists',
  'Albums',
  'Podcasts',
  'Settings',
  'Account',
  'Help & feedback',
  'About'
];

@Component({
  selector: 'rdx-drawer-scrollable',
  imports: [...drawerImports],
  template: `
    <div rdxDrawerRoot>
      <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open menu</button>

      <ng-template rdxDrawerPortalPresence>
        <div [class]="d.portalAnimated" rdxDrawerPortal>
          <div [class]="d.backdrop" rdxDrawerBackdrop></div>

          <div [class]="cn(d.popup, d.side.bottom, 'h-[70vh]')" rdxDrawerPopup>
            <div [class]="d.grip" aria-hidden="true"></div>

            <!-- Header stays put: a swipe started here always dismisses. -->
            <div class="border-border border-b px-6 py-3">
              <h2 [class]="d.title" rdxDrawerTitle>Navigation</h2>
              <p [class]="d.description" rdxDrawerDescription>
                Scroll the list; the drawer only swipes away once the list is at the top.
              </p>
            </div>

            <!-- Scroll region: a swipe started here yields to scrolling until at the edge. -->
            <nav [class]="d.body" rdxDrawerContent>
              <ul class="flex flex-col">
                @for (link of links; track link) {
                  <li>
                    <button
                      [class]="
                        cn(
                          'text-foreground w-full rounded-md px-3 py-3 text-left text-sm',
                          'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
                        )
                      "
                      rdxDrawerClose
                    >
                      {{ link }}
                    </button>
                  </li>
                }
              </ul>
            </nav>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class RdxDrawerScrollableComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly d = demoDrawer;
  protected readonly links = LINKS;
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
        Non-modal: page scrolling and outside pointer interactions stay enabled while the drawer is open, and there is
        no backdrop.
      </p>

      <div [modal]="false" rdxDrawerRoot>
        <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open non-modal drawer</button>

        <ng-template rdxDrawerPortalPresence>
          <div [class]="d.portalAnimated" rdxDrawerPortal>
            <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
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

      <ng-template rdxDrawerPortalPresence>
        <div [class]="d.portalAnimated" rdxDrawerPortal>
          <div [class]="d.backdrop" rdxDrawerBackdrop></div>

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
              <button [class]="cn(action, 'border-border text-destructive border-b font-medium')" rdxDrawerClose>
                Delete Photo
              </button>

              <div class="bg-muted h-2" aria-hidden="true"></div>
              <button [class]="cn(action, 'font-semibold')" rdxDrawerClose>Cancel</button>
            </div>
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

      <ng-template rdxDrawerPortalPresence>
        <div [class]="d.portalAnimated" rdxDrawerPortal>
          <div [class]="d.backdrop" rdxDrawerBackdrop></div>

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
region with `rdxDrawerIndentBackground` / `rdxDrawerIndent`. It gains `[data-active]`,
`--nested-drawers`, and `--drawer-frontmost-height` while any drawer is open, for an iOS-style
page-scale effect.

```typescript
import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
  selector: 'rdx-drawer-page-scale',
  imports: [...drawerImports],
  template: `
    <!-- The provider tracks every open drawer; the indented region reacts via [data-active]. -->
    <div class="w-full max-w-md" rdxDrawerProvider>
      <div [class]="cn(d.indent, 'border-border bg-muted/40 rounded-xl border p-6')" rdxDrawerIndentBackground>
        <h3 class="text-foreground text-sm font-semibold">Page content</h3>
        <p class="text-muted-foreground mt-1 text-sm">
          This panel scales back while the drawer is open, like an iOS sheet pushing the page away.
        </p>

        <div rdxDrawerRoot>
          <button [class]="cn(b.base, b.primary, b.size.md, 'mt-4')" rdxDrawerTrigger>Open drawer</button>

          <ng-template rdxDrawerPortalPresence>
            <div [class]="d.portalAnimated" rdxDrawerPortal>
              <div [class]="d.backdrop" rdxDrawerBackdrop></div>
              <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                <div [class]="d.grip" aria-hidden="true"></div>
                <div [class]="d.body" rdxDrawerContent>
                  <h2 [class]="d.title" rdxDrawerTitle>Sheet</h2>
                  <p [class]="d.description" rdxDrawerDescription>Close me to restore the page.</p>
                  <div [class]="d.footer">
                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
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
        <button id="cart" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDrawerTrigger>Cart</button>
        <button id="account" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDrawerTrigger>
          Account
        </button>
      </div>

      <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('account')">
        Open account imperatively
      </button>

      <div [handle]="handle" rdxDrawerRoot>
        <ng-template rdxDrawerPortalPresence>
          <div [class]="d.portalAnimated" rdxDrawerPortal>
            <div [class]="d.backdrop" rdxDrawerBackdrop></div>

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
`[data-active]`, `--nested-drawers`, and `--drawer-frontmost-height`; they take no inputs.

### Trigger, Portal, Viewport, Backdrop, Content, Title, Description, and Close

These parts wrap their Dialog counterparts (or, for `Content`, mark the scrollable body) and read state
from context. See the Dialog docs for the trigger and portal inputs.
