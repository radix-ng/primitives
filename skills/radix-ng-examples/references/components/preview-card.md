# Preview Card

#### A popup that appears when a link is hovered or focused, showing a visual preview.

```typescript
import { Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-preview-card-default',
  imports: [...previewCardImports],
  template: `
    <ng-container rdxPreviewCardRoot>
      <p class="text-muted-foreground max-w-md text-sm leading-6">
        The principles of good
        <a
          [class]="link"
          href="https://en.wikipedia.org/wiki/Typography"
          rel="noreferrer"
          target="_blank"
          rdxPreviewCardTrigger
        >
          typography
        </a>
        remain in the digital age.
      </p>

      <ng-template rdxPreviewCardPortalPresence>
        <div rdxPreviewCardPortal>
          <div [class]="p.positioner" sideOffset="8" rdxPreviewCardPositioner>
            <div [class]="p.popup" rdxPreviewCardPopup>
              <span [class]="p.arrow" rdxPreviewCardArrow></span>
              <div class="grid gap-3">
                <div class="bg-muted h-28 rounded-md"></div>
                <p class="text-muted-foreground text-sm">
                  <strong class="text-foreground font-medium">Typography</strong>
                  is the art and science of arranging type to make written language clear and effective.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
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
  RdxPreviewCardPortalPresence,
  RdxPreviewCardPortal,
  RdxPreviewCardBackdrop,
  RdxPreviewCardPositioner,
  RdxPreviewCardPopup,
  RdxPreviewCardArrow,
  RdxPreviewCardViewport
} from '@radix-ng/primitives/preview-card';`}
/>

## Anatomy

Apply the parts to your own markup. The root is virtual; the portal presence wrapper keeps the
content mounted while CSS exit animations finish.

```html
<ng-container rdxPreviewCardRoot>
  <a href="#" rdxPreviewCardTrigger>Preview link</a>

  <ng-template rdxPreviewCardPortalPresence>
    <div rdxPreviewCardPortal>
      <div rdxPreviewCardBackdrop></div>

      <div rdxPreviewCardPositioner>
        <div rdxPreviewCardPopup>
          <span rdxPreviewCardArrow></span>
          <div rdxPreviewCardViewport>Preview content</div>
        </div>
      </div>
    </div>
  </ng-template>
</ng-container>
```

## Examples

### Controlled Multiple

Control both the open state and the active trigger id.

```typescript
import { Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-preview-card-controlled-multiple',
  imports: [...previewCardImports],
  template: `
    <div class="grid gap-4">
      <div class="flex items-center gap-3">
        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="openFrom('design')" type="button">
          Open design
        </button>
        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open = false" type="button">Close</button>
      </div>

      <ng-container
        #root="rdxPreviewCardRoot"
        [(open)]="open"
        [(triggerId)]="triggerId"
        (onOpenChange)="triggerId = $event.triggerId"
        rdxPreviewCardRoot
      >
        <p class="text-muted-foreground max-w-lg text-sm leading-6">
          Discover
          <a id="typography" [class]="link" [payload]="cards.typography" href="#" rdxPreviewCardTrigger>typography</a>
          ,
          <a id="design" [class]="link" [payload]="cards.design" href="#" rdxPreviewCardTrigger>design</a>
          , or
          <a id="art" [class]="link" [payload]="cards.art" href="#" rdxPreviewCardTrigger>art</a>
          .
        </p>

        <ng-template rdxPreviewCardPortalPresence>
          <div rdxPreviewCardPortal>
            <div [class]="p.positioner" sideOffset="8" rdxPreviewCardPositioner>
              <div [class]="p.popup" rdxPreviewCardPopup>
                <span [class]="p.arrow" rdxPreviewCardArrow></span>
                <div class="grid gap-2">
                  <div class="bg-muted h-24 rounded-md"></div>
                  <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
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
import { Component } from '@angular/core';
import { createRdxPreviewCardHandle, previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-preview-card-detached',
  imports: [...previewCardImports],
  template: `
    <div class="grid gap-4">
      <p class="text-muted-foreground max-w-lg text-sm leading-6">
        Detached triggers can live outside the root:
        <a
          id="typography"
          [class]="link"
          [handle]="previewCard"
          href="#"
          payload="Typography preview"
          rdxPreviewCardTrigger
        >
          typography
        </a>
        and
        <a id="design" [class]="link" [handle]="previewCard" href="#" payload="Design preview" rdxPreviewCardTrigger>
          design
        </a>
        .
      </p>

      <ng-container #root="rdxPreviewCardRoot" [handle]="previewCard" rdxPreviewCardRoot>
        <ng-template rdxPreviewCardPortalPresence>
          <div rdxPreviewCardPortal>
            <div [class]="p.positioner" sideOffset="8" rdxPreviewCardPositioner>
              <div [class]="p.popup" rdxPreviewCardPopup>
                <span [class]="p.arrow" rdxPreviewCardArrow></span>
                <div class="grid gap-2">
                  <div class="bg-muted h-24 rounded-md"></div>
                  <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
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
import { Component, signal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoButton, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-preview-card-positioning',
  imports: [...previewCardImports],
  template: `
    <div class="grid gap-4">
      <div class="flex flex-wrap gap-2">
        @for (option of sides; track option) {
          <button
            [class]="cn(b.base, side() === option ? b.primary : b.outline, b.size.sm)"
            (click)="side.set(option)"
            type="button"
          >
            {{ option }}
          </button>
        }
      </div>

      <ng-container rdxPreviewCardRoot>
        <a [class]="link" href="#" rdxPreviewCardTrigger>Hover the positioned preview card</a>

        <ng-template rdxPreviewCardPortalPresence>
          <div rdxPreviewCardPortal>
            <div [class]="p.positioner" [side]="side()" sideOffset="8" rdxPreviewCardPositioner>
              <div [class]="p.popup" rdxPreviewCardPopup>
                <span [class]="p.arrow" rdxPreviewCardArrow></span>
                <p class="text-muted-foreground text-sm">
                  The positioner exposes placement attributes and CSS variables for styling.
                </p>
              </div>
            </div>
          </div>
        </ng-template>
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
import { Component } from '@angular/core';
import { previewCardImports } from '@radix-ng/primitives/preview-card';
import { cn, demoFocusRing, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-preview-card-viewport',
  imports: [...previewCardImports],
  template: `
    <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
      <p class="text-muted-foreground max-w-lg text-sm leading-6">
        Compare
        <a [class]="link" href="#" payload="Typography arranges type for readable language." rdxPreviewCardTrigger>
          typography
        </a>
        ,
        <a [class]="link" href="#" payload="Design shapes objects and systems." rdxPreviewCardTrigger>design</a>
        , and
        <a [class]="link" href="#" payload="Art communicates ideas through creative work." rdxPreviewCardTrigger>art</a>
        .
      </p>

      <ng-template rdxPreviewCardPortalPresence>
        <div rdxPreviewCardPortal>
          <div
            [class]="cn(p.positioner, 'transition-[left,right,top,bottom] duration-200')"
            sideOffset="8"
            rdxPreviewCardPositioner
          >
            <div [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')" rdxPreviewCardPopup>
              <span [class]="p.arrow" rdxPreviewCardArrow></span>
              <div rdxPreviewCardViewport>
                <div class="grid gap-2">
                  <div class="bg-muted h-24 rounded-md"></div>
                  <p class="text-muted-foreground text-sm">{{ root.payload() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
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

A link or element that opens the preview card.

### Positioner

Positions the popup against the active trigger or a custom anchor.

### Popup

The floating preview surface. It exposes dismiss events and transition attributes.
