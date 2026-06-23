# Preview Card

#### A popup that appears when a link is hovered or focused, showing a visual preview.

```typescript
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-default',
    imports: [...previewCardImports],
    template: `
        <ng-container rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-md text-sm leading-6">
                The principles of good
                <a
                    href="https://en.wikipedia.org/wiki/Typography"
                    rel="noreferrer"
                    target="_blank"
                    rdxPreviewCardTrigger
                    [class]="link"
                >
                    typography
                </a>
                remain in the digital age.
            </p>

            <div *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner [class]="p.positioner">
                <div rdxPreviewCardPopup [class]="p.popup">
                    <span rdxPreviewCardArrow [class]="p.arrow"></span>
                    <div class="grid gap-3">
                        <div class="bg-muted h-28 rounded-md"></div>
                        <p class="text-muted-foreground text-sm">
                            <strong class="text-foreground font-medium">Typography</strong>
                            is the art and science of arranging type to make written language clear and effective.
                        </p>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPreviewCardDefaultComponent {
    protected readonly cn = cn;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
```

## Features

- ✅ Aligns with Base UI `PreviewCard` anatomy and interaction semantics.
- ✅ Uses a virtual root via `ng-container[rdxPreviewCardRoot]`, so layout is not affected.
- ✅ Opens from hover or focus with per-trigger `delay` and `closeDelay`.
- ✅ Supports detached triggers, multiple triggers, controlled state, and controlled trigger ids.
- ✅ Supports portaled content, custom positioning, arrows, and viewport content transitions.
- ✅ Exposes state, transition, placement, and anchor measurement attributes and CSS variables for styling.
- ✅ Keeps hover-opened content interactive with a polygon grace area, including nested popup content.

## Import

<Source
  type="code"
  language="typescript"
  code={`import {
  RdxPreviewCardRoot,
  RdxPreviewCardTrigger,
  RdxPreviewCardPortal,
  RdxPreviewCardBackdrop,
  RdxPreviewCardPositioner,
  RdxPreviewCardPopup,
  RdxPreviewCardArrow,
  RdxPreviewCardViewport
} from '@radix-ng/primitives/preview-card';`}
/>

## Anatomy

Apply the parts to your own markup. The root is virtual; `rdxPreviewCardPortal` is a **structural**
directive that teleports the content into `document.body` while the card is open and keeps it mounted
until any closed-state CSS exit keyframes on its root element finish.

Use the `*` microsyntax on the positioner for the common single-root case:

```html
<ng-container rdxPreviewCardRoot>
  <a href="#" rdxPreviewCardTrigger>Preview link</a>

  <div *rdxPreviewCardPortal rdxPreviewCardPositioner>
    <div rdxPreviewCardPopup>
      <span rdxPreviewCardArrow></span>
      <div rdxPreviewCardViewport>Preview content</div>
    </div>
  </div>
</ng-container>
```

When the content has more than one root node — for example an optional `rdxPreviewCardBackdrop` next
to the positioner — use the explicit `<ng-template rdxPreviewCardPortal>` form (and the same form with
`[container]` for a custom portal target):

```html
<ng-template rdxPreviewCardPortal>
  <div rdxPreviewCardBackdrop></div>
  <div rdxPreviewCardPositioner>
    <div rdxPreviewCardPopup>…</div>
  </div>
</ng-template>
```

## Examples

### Controlled Multiple

Control both the open state and the active trigger id.

```typescript
import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-controlled-multiple',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <div class="flex items-center gap-3">
                <button type="button" [class]="cn(b.base, b.outline, b.size.sm)" (click)="openFrom('design')">
                    Open design
                </button>
                <button type="button" [class]="cn(b.base, b.outline, b.size.sm)" (click)="open = false">Close</button>
            </div>

            <ng-container
                #root="rdxPreviewCardRoot"
                rdxPreviewCardRoot
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="triggerId = $event.triggerId"
            >
                <p class="text-muted-foreground max-w-lg text-sm leading-6">
                    Discover
                    <a id="typography" href="#" rdxPreviewCardTrigger [class]="link" [payload]="cards.typography">
                        typography
                    </a>
                    ,
                    <a id="design" href="#" rdxPreviewCardTrigger [class]="link" [payload]="cards.design">design</a>
                    , or
                    <a id="art" href="#" rdxPreviewCardTrigger [class]="link" [payload]="cards.art">art</a>
                    .
                </p>

                <div *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner [class]="p.positioner">
                    <div rdxPreviewCardPopup [class]="p.popup">
                        <span rdxPreviewCardArrow [class]="p.arrow"></span>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardControlledMultipleComponent {
    open = false;
    triggerId: 'typography' | 'design' | 'art' | null = null;

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
    protected readonly cards = {
        typography: 'Typography arranges type to make written language clear and effective.',
        design: 'Design shapes the concept and structure of an object, process, or system.',
        art: 'Art communicates ideas and emotion through creative work.'
    } as const;

    openFrom(id: 'typography' | 'design' | 'art') {
        this.triggerId = id;
        this.open = true;
    }
}
```

### Detached

Associate triggers outside the root through a shared handle.

```typescript
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createRdxPreviewCardHandle, previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-detached',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Detached triggers can live outside the root:
                <a
                    id="typography"
                    href="#"
                    payload="Typography preview"
                    rdxPreviewCardTrigger
                    [class]="link"
                    [handle]="previewCard"
                >
                    typography
                </a>
                and
                <a
                    id="design"
                    href="#"
                    payload="Design preview"
                    rdxPreviewCardTrigger
                    [class]="link"
                    [handle]="previewCard"
                >
                    design
                </a>
                .
            </p>

            <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot [handle]="previewCard">
                <div *rdxPreviewCardPortal sideOffset="8" rdxPreviewCardPositioner [class]="p.positioner">
                    <div rdxPreviewCardPopup [class]="p.popup">
                        <span rdxPreviewCardArrow [class]="p.arrow"></span>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardDetachedComponent {
    protected readonly previewCard = createRdxPreviewCardHandle<string>();
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
```

### Positioning

Configure side, offsets, collision behavior, and arrow padding on the positioner.

```typescript
import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-positioning',
    imports: [...previewCardImports],
    template: `
        <div class="grid gap-4">
            <div class="flex flex-wrap gap-2">
                @for (option of sides; track option) {
                    <button
                        type="button"
                        [class]="cn(b.base, side() === option ? b.primary : b.outline, b.size.sm)"
                        (click)="side.set(option)"
                    >
                        {{ option }}
                    </button>
                }
            </div>

            <ng-container rdxPreviewCardRoot>
                <a href="#" rdxPreviewCardTrigger [class]="link">Hover the positioned preview card</a>

                <div
                    *rdxPreviewCardPortal
                    sideOffset="8"
                    rdxPreviewCardPositioner
                    [class]="p.positioner"
                    [side]="side()"
                >
                    <div rdxPreviewCardPopup [class]="p.popup">
                        <span rdxPreviewCardArrow [class]="p.arrow"></span>
                        <p class="text-muted-foreground text-sm">
                            The positioner exposes placement attributes and CSS variables for styling.
                        </p>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxPreviewCardPositioningComponent {
    protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
    protected readonly side = signal<Side>('bottom');
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
```

### Viewport

Animate content changes when different triggers render different payloads.

```typescript
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-preview-card-viewport',
    imports: [...previewCardImports],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <p class="text-muted-foreground max-w-lg text-sm leading-6">
                Compare
                <a
                    href="#"
                    payload="Typography arranges type for readable language."
                    rdxPreviewCardTrigger
                    [class]="link"
                >
                    typography
                </a>
                ,
                <a href="#" payload="Design shapes objects and systems." rdxPreviewCardTrigger [class]="link">design</a>
                , and
                <a
                    href="#"
                    payload="Art communicates ideas through creative work."
                    rdxPreviewCardTrigger
                    [class]="link"
                >
                    art
                </a>
                .
            </p>

            <div
                *rdxPreviewCardPortal
                sideOffset="8"
                rdxPreviewCardPositioner
                [class]="cn(p.positioner, 'transition-[left,right,top,bottom] duration-200')"
            >
                <div
                    rdxPreviewCardPopup
                    [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')"
                >
                    <span rdxPreviewCardArrow [class]="p.arrow"></span>
                    <div rdxPreviewCardViewport>
                        <div class="grid gap-2">
                            <div class="bg-muted h-24 rounded-md"></div>
                            <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPreviewCardViewportComponent {
    protected readonly cn = cn;
    protected readonly p = demoPopover;
    protected readonly link = cn('font-medium text-primary underline underline-offset-4', demoFocusRing);
}
```

## API Reference

### Root

Groups all parts of the preview card. Does not render its own HTML element.

### Trigger

A link (or element) that opens the preview card on hover / focus. Because the preview is supplementary
content reached from a link — not a dialog — the trigger carries **no** `aria-haspopup` / `aria-expanded`
/ `aria-controls` (matching Base UI); only state hooks.

**Data attributes**

| Attribute         | Present when                          |
| ----------------- | ------------------------------------- |
| `data-popup-open` | The preview card is open.             |
| `data-pressed`    | The trigger is pressed.               |
| `data-disabled`   | The trigger is disabled.              |

### Positioner

Positions the popup against the active trigger or a custom anchor.

**Data attributes**: `data-open`, `data-closed`, `data-side`, `data-align`, `data-anchor-hidden`,
`data-instant` (`delay`-free: `'focus'` / `'dismiss'`).

**CSS variables**: `--anchor-width` / `--anchor-height`, `--available-width` / `--available-height`,
`--transform-origin`.

### Popup

The floating preview surface. It exposes dismiss events and transition attributes.

**Data attributes**

| Attribute             | Present when / value                                                       |
| --------------------- | ------------------------------------------------------------------------- |
| `data-open`           | The preview card is open.                                                  |
| `data-closed`         | The preview card is closed.                                               |
| `data-side`           | Resolved side — `top` / `right` / `bottom` / `left`.                       |
| `data-align`          | Resolved alignment — `start` / `center` / `end`.                          |
| `data-starting-style` | The enter transition is about to run.                                     |
| `data-ending-style`   | The exit transition is running.                                           |
| `data-instant`        | An instant open/close — `focus` (focus open) / `dismiss` (trigger-press or Escape close). |

### Arrow, Backdrop, and Viewport

`Arrow` reflects `data-open` / `data-closed` / `data-side` / `data-align` / `data-uncentered`.
`Backdrop` reflects `data-open` / `data-closed` / `data-starting-style` / `data-ending-style` /
`data-instant`. `Viewport` (for content morphing between triggers) reflects `data-activation-direction`,
`data-transitioning`, and `data-instant`, and marks its current/previous children with
`data-current` / `data-previous`.

## Accessibility

### Keyboard Interactions

| Key                     | Description                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift` + `Tab` | Moves focus onto the trigger (opening the preview card after the delay) or away from it (closing it). |
| `Escape`                | Closes the open preview card.                                                                     |
