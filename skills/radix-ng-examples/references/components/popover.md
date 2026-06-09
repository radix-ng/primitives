# Popover

#### An accessible popup anchored to a button.

Popover composes the shared Popper, Portal, Presence, Dismissable Layer, and Focus Scope primitives.
It remains headless: styles and native CSS animations belong to the consumer.

```typescript
import { Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-default',
  imports: [...popoverImports, LucidePlus, LucideX],
  template: `
    <ng-container rdxPopoverRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>
        <svg aria-hidden="true" lucidePlus size="16" />
        Add details
      </button>

      <ng-template rdxPopoverPortalPresence>
        <div rdxPopoverPortal>
          <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
            <div [class]="p.popup" rdxPopoverPopup>
              <span [class]="p.arrow" rdxPopoverArrow></span>
              <h2 [class]="p.title" rdxPopoverTitle>Dimensions</h2>
              <p [class]="p.description" rdxPopoverDescription>Set the width and height for the element.</p>

              <div class="mt-4 grid gap-3">
                <label class="grid gap-1 text-xs font-medium">
                  Width
                  <input [class]="input" value="100%" />
                </label>
                <label class="grid gap-1 text-xs font-medium">
                  Max width
                  <input [class]="input" value="300px" />
                </label>
              </div>

              <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                <svg aria-hidden="true" lucideX size="14" />
              </button>
            </div>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `
})
export class RdxPopoverDefaultComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly input = demoInput;
  protected readonly p = demoPopover;
}
```

## Features

- ✅ Opens and closes from a native button trigger.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Controls the active trigger externally with `[(triggerId)]` and `defaultTriggerId`.
- ✅ Positions content with the shared Floating UI-based Popper primitive.
- ✅ Supports a custom positioning anchor independently from the trigger.
- ✅ Connects detached roots and multiple triggers through a shared handle.
- ✅ Opens on hover with configurable per-trigger open and close delays.
- ✅ Keeps hover-opened content interactive with a polygon grace area, including nested popup content.
- ✅ Exposes pressed state on triggers for press interactions.
- ✅ Animates content changes between triggers with an optional viewport.
- ✅ Exposes transition lifecycle attributes and `onOpenChangeComplete` for CSS animations.
- ✅ Supports non-modal, modal, and focus-trapping-only behavior.
- ✅ Closes on Escape, outside pointer interaction, or an explicit close button.
- ✅ Restores focus through the shared Focus Scope behavior.
- ✅ Exposes state, transition, placement, and anchor measurement attributes and CSS variables for styling.
- ✅ Keeps portal content mounted while CSS exit keyframes finish.
- ✅ Links the popup to optional title and description parts for accessible labeling.

## Import

```typescript
import {
  createRdxPopoverHandle,
  RdxPopoverArrow,
  RdxPopoverBackdrop,
  RdxPopoverClose,
  RdxPopoverDescription,
  RdxPopoverPopup,
  RdxPopoverPortal,
  RdxPopoverPortalPresence,
  RdxPopoverPositioner,
  RdxPopoverRoot,
  RdxPopoverTitle,
  RdxPopoverTrigger,
  RdxPopoverViewport
} from '@radix-ng/primitives/popover';
```

Or import all parts through the module:

```typescript
import { RdxPopoverModule } from '@radix-ng/primitives/popover';
```

## Anatomy

Apply the parts to your own markup. `rdxPopoverPortalPresence` manages mounting and waits for exit
keyframes on the first DOM element inside its template.

```html
<ng-container rdxPopoverRoot>
  <button rdxPopoverTrigger>Open</button>

  <ng-template rdxPopoverPortalPresence>
    <div rdxPopoverPortal>
      <div rdxPopoverBackdrop></div>
      <div sideOffset="8" rdxPopoverPositioner>
        <div rdxPopoverPopup>
          <span rdxPopoverArrow></span>
          <div rdxPopoverViewport>
            <div>
              <h2 rdxPopoverTitle>Notifications</h2>
              <p rdxPopoverDescription>You are all caught up.</p>
              <button rdxPopoverClose>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ng-template>
</ng-container>
```

## Examples

### Default

A form-like popup with an arrow, accessible title and description, and a close button.

```typescript
import { Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-default',
  imports: [...popoverImports, LucidePlus, LucideX],
  template: `
    <ng-container rdxPopoverRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>
        <svg aria-hidden="true" lucidePlus size="16" />
        Add details
      </button>

      <ng-template rdxPopoverPortalPresence>
        <div rdxPopoverPortal>
          <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
            <div [class]="p.popup" rdxPopoverPopup>
              <span [class]="p.arrow" rdxPopoverArrow></span>
              <h2 [class]="p.title" rdxPopoverTitle>Dimensions</h2>
              <p [class]="p.description" rdxPopoverDescription>Set the width and height for the element.</p>

              <div class="mt-4 grid gap-3">
                <label class="grid gap-1 text-xs font-medium">
                  Width
                  <input [class]="input" value="100%" />
                </label>
                <label class="grid gap-1 text-xs font-medium">
                  Max width
                  <input [class]="input" value="300px" />
                </label>
              </div>

              <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                <svg aria-hidden="true" lucideX size="14" />
              </button>
            </div>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `
})
export class RdxPopoverDefaultComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly input = demoInput;
  protected readonly p = demoPopover;
}
```

### Controlled

Bind `[(open)]` when application state should open or close the popover programmatically. This
example also includes the optional backdrop part.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-controlled',
  imports: [...popoverImports, LucideX],
  template: `
    <div class="flex flex-col items-center gap-4">
      <div class="flex items-center gap-2">
        <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="open.set(true)">Open externally</button>
        <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="open.set(false)">Close externally</button>
      </div>

      <p class="text-muted-foreground text-xs">State: {{ open() ? 'open' : 'closed' }}</p>

      <ng-container [(open)]="open" rdxPopoverRoot>
        <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Toggle popover</button>

        <ng-template rdxPopoverPortalPresence>
          <div rdxPopoverPortal>
            <div [class]="p.backdrop" rdxPopoverBackdrop></div>
            <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
              <div [class]="p.popup" rdxPopoverPopup>
                <span [class]="p.arrow" rdxPopoverArrow></span>
                <h2 [class]="p.title" rdxPopoverTitle>Controlled state</h2>
                <p [class]="p.description" rdxPopoverDescription>
                  The root uses Angular two-way binding with a signal.
                </p>
                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                  <svg aria-hidden="true" lucideX size="14" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class RdxPopoverControlledComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
  protected readonly open = signal(false);
}
```

### Controlled mode with multiple triggers

Bind both `[(open)]` and `[(triggerId)]` when application state should choose the active anchor.
`onOpenChange` reports the trigger element, trigger id, source event, and change reason.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports, RdxPopoverOpenChange } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-controlled-multiple',
  imports: [...popoverImports, LucideX],
  template: `
    <div class="flex flex-col items-center gap-4">
      <ng-container [(open)]="open" [(triggerId)]="triggerId" (onOpenChange)="handleOpenChange($event)" rdxPopoverRoot>
        <div class="flex flex-wrap justify-center gap-2">
          @for (item of items; track item.id) {
            <button [class]="cn(b.base, b.outline, b.size.sm)" [id]="item.id" [payload]="item" rdxPopoverTrigger>
              {{ item.label }}
            </button>
          }

          <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="openProgrammatically()">
            Open programmatically
          </button>
        </div>

        <ng-template rdxPopoverPortalPresence>
          <div rdxPopoverPortal>
            <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
              <div [class]="p.popup" rdxPopoverPopup>
                <span [class]="p.arrow" rdxPopoverArrow></span>
                <h2 [class]="p.title" rdxPopoverTitle>{{ activeItem()?.label }}</h2>
                <p [class]="p.description" rdxPopoverDescription>
                  The externally controlled trigger id is {{ triggerId() }}.
                </p>
                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                  <svg aria-hidden="true" lucideX size="14" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>

      <p class="text-muted-foreground text-center text-xs">
        State: {{ open() ? 'open' : 'closed' }} · Trigger: {{ triggerId() ?? 'none' }} · Reason:
        {{ lastReason() }}
      </p>
    </div>
  `
})
export class RdxPopoverControlledMultipleComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
  protected readonly open = signal(false);
  protected readonly triggerId = signal<string | null>(null);
  protected readonly lastReason = signal('none');
  protected readonly items = [
    { id: 'notifications', label: 'Notifications' },
    { id: 'activity', label: 'Activity' },
    { id: 'profile', label: 'Profile' }
  ];

  protected activeItem() {
    return this.items.find((item) => item.id === this.triggerId());
  }

  protected openProgrammatically() {
    this.triggerId.set('activity');
    this.open.set(true);
  }

  protected handleOpenChange(change: RdxPopoverOpenChange) {
    this.lastReason.set(change.reason);
  }
}
```

### Positioning

Configure `side`, `sideOffset`, `align`, and collision behavior on `rdxPopoverPositioner`. The
shared Popper primitive updates `data-side` and `data-align` after collision handling.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { Side } from '@radix-ng/primitives/popper';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-positioning',
  imports: [...popoverImports, LucideX],
  template: `
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        @for (side of sides; track side) {
          <button
            [class]="cn(b.base, selectedSide() === side ? b.primary : b.outline, b.size.sm)"
            (click)="selectedSide.set(side)"
          >
            {{ side }}
          </button>
        }
      </div>

      <ng-container rdxPopoverRoot>
        <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Open {{ selectedSide() }}</button>

        <ng-template rdxPopoverPortalPresence>
          <div rdxPopoverPortal>
            <div [class]="p.positioner" [side]="selectedSide()" sideOffset="8" rdxPopoverPositioner>
              <div [class]="p.popup" rdxPopoverPopup>
                <span [class]="p.arrow" rdxPopoverArrow></span>
                <h2 [class]="p.title" rdxPopoverTitle>Positioned popup</h2>
                <p [class]="p.description" rdxPopoverDescription>
                  The positioner delegates collision handling to the shared Popper primitive.
                </p>
                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                  <svg aria-hidden="true" lucideX size="14" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class RdxPopoverPositioningComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
  protected readonly sides: Side[] = ['top', 'right', 'bottom', 'left'];
  protected readonly selectedSide = signal<Side>('bottom');
}
```

### Animation

For presence-managed content, apply native CSS keyframe animation utilities to the portal element.
The closed animation keeps the portal mounted until `animationend`.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-animated',
  imports: [...popoverImports, LucideX],
  template: `
    <ng-container rdxPopoverRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Animated popover</button>

      <ng-template rdxPopoverPortalPresence>
        <div [class]="p.portalAnimated" rdxPopoverPortal>
          <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
            <div [class]="cn(p.popup, p.popupAnimated)" rdxPopoverPopup>
              <span [class]="p.arrow" rdxPopoverArrow></span>
              <h2 [class]="p.title" rdxPopoverTitle>Native CSS keyframes</h2>
              <p [class]="p.description" rdxPopoverDescription>
                Presence keeps this portal mounted until the exit animation finishes.
              </p>
              <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                <svg aria-hidden="true" lucideX size="14" />
              </button>
            </div>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `
})
export class RdxPopoverAnimatedComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
}
```

### Modal behavior

Set `modal` on `rdxPopoverRoot` to block outside interaction, or use `"trap-focus"` to keep focus
inside while leaving document scrolling and outside pointer interactions available.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports, RdxPopoverModal } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-modal',
  imports: [...popoverImports, LucideX],
  template: `
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        @for (option of options; track option.label) {
          <button
            [class]="cn(b.base, modal() === option.value ? b.primary : b.outline, b.size.sm)"
            (click)="modal.set(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>

      <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
        {{ description() }}
      </p>

      <ng-container [modal]="modal()" rdxPopoverRoot>
        <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Open popover</button>

        <ng-template rdxPopoverPortalPresence>
          <div rdxPopoverPortal>
            @if (modal() === true) {
              <div [class]="p.backdrop" rdxPopoverBackdrop></div>
            }
            <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
              <div [class]="p.popup" rdxPopoverPopup>
                <span [class]="p.arrow" rdxPopoverArrow></span>
                <h2 [class]="p.title" rdxPopoverTitle>Modal behavior</h2>
                <p [class]="p.description" rdxPopoverDescription>
                  Switch modes, use Tab to move between controls, then try the outside button.
                </p>

                <label class="mt-4 grid gap-1 text-xs font-medium">
                  Name
                  <input [class]="input" placeholder="Focused when opened" />
                </label>

                <button [class]="cn(b.base, b.primary, b.size.sm, 'mt-3')" type="button">Save changes</button>

                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                  <svg aria-hidden="true" lucideX size="14" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>

      <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
        Outside interaction target: {{ outsideClicks() }}
      </button>
    </div>
  `
})
export class RdxPopoverModalComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly input = demoInput;
  protected readonly p = demoPopover;
  protected readonly modal = signal<RdxPopoverModal>(true);
  protected readonly outsideClicks = signal(0);
  protected readonly options: Array<{ label: string; value: RdxPopoverModal }> = [
    { label: 'Non-modal', value: false },
    { label: 'Modal', value: true },
    { label: 'Trap focus', value: 'trap-focus' }
  ];

  protected description() {
    switch (this.modal()) {
      case true:
        return 'Modal: outside pointer interactions and document scrolling are blocked. Focus is trapped because the popup contains a close button.';
      case 'trap-focus':
        return 'Trap focus: keyboard focus stays inside, while document scrolling and outside pointer interactions remain available.';
      default:
        return 'Non-modal: outside pointer interactions and document scrolling remain available.';
    }
  }
}
```

### Custom anchor

Pass `[anchor]` to `rdxPopoverPositioner` when the popup should open from a trigger but position
itself against a different element.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-custom-anchor',
  imports: [...popoverImports, LucideX],
  template: `
    <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
      <ng-container rdxPopoverRoot>
        <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Open from this button</button>

        <div
          class="border-primary bg-primary/10 text-foreground flex h-24 w-56 items-center justify-center rounded-lg border border-dashed text-center text-sm font-medium"
          #customAnchor
        >
          Popup anchor
        </div>

        <ng-template rdxPopoverPortalPresence>
          <div rdxPopoverPortal>
            <div [class]="p.positioner" [anchor]="customAnchor" sideOffset="8" rdxPopoverPositioner>
              <div [class]="p.popup" rdxPopoverPopup>
                <span [class]="p.arrow" rdxPopoverArrow></span>
                <h2 [class]="p.title" rdxPopoverTitle>Custom anchor</h2>
                <p [class]="p.description" rdxPopoverDescription>
                  The trigger controls open state, but the positioner is anchored to the dashed box.
                </p>
                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                  <svg aria-hidden="true" lucideX size="14" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class RdxPopoverCustomAnchorComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
}
```

### Detached handles

Create a shared handle when triggers live outside the root or multiple triggers should control the
same popup. The handle also supports imperative `open(id)`, `toggle(id)`, and `close()` calls.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { createRdxPopoverHandle, popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-detached',
  imports: [...popoverImports, LucideX],
  template: `
    <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
      <div class="flex w-full justify-between gap-4">
        <button id="account" [class]="cn(b.base, b.outline, b.size.md)" [handle]="popover" rdxPopoverTrigger>
          Account trigger
        </button>

        <button id="billing" [class]="cn(b.base, b.outline, b.size.md)" [handle]="popover" rdxPopoverTrigger>
          Billing trigger
        </button>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="popover.open('account')">Open account</button>
        <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="popover.open('billing')">Open billing</button>
        <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="popover.close()">Close</button>
      </div>

      <ng-container [handle]="popover" rdxPopoverRoot>
        <ng-template rdxPopoverPortalPresence>
          <div rdxPopoverPortal>
            <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
              <div [class]="p.popup" rdxPopoverPopup>
                <span [class]="p.arrow" rdxPopoverArrow></span>
                <h2 [class]="p.title" rdxPopoverTitle>Detached handles</h2>
                <p [class]="p.description" rdxPopoverDescription>
                  Both triggers live outside the root. Open another trigger to move this popup without closing it first.
                </p>
                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                  <svg aria-hidden="true" lucideX size="14" />
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `
})
export class RdxPopoverDetachedComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
  protected readonly popover = createRdxPopoverHandle();
}
```

### Opening on hover

Add `openOnHover` to a trigger when pointer users should be able to open its popup without clicking.
Use `delay` and `closeDelay` on the same trigger to configure the timing.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-hover',
  imports: [...popoverImports, LucideX],
  template: `
    <ng-container rdxPopoverRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" [delay]="300" openOnHover rdxPopoverTrigger>
        Hover for details
      </button>

      <ng-template rdxPopoverPortalPresence>
        <div rdxPopoverPortal>
          <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
            <div [class]="p.popup" rdxPopoverPopup>
              <span [class]="p.arrow" rdxPopoverArrow></span>
              <h2 [class]="p.title" rdxPopoverTitle>Hover popover</h2>
              <p [class]="p.description" rdxPopoverDescription>
                Move the pointer into this popup. It remains interactive after leaving the trigger.
              </p>
              <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                <svg aria-hidden="true" lucideX size="14" />
              </button>
            </div>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `
})
export class RdxPopoverHoverComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
}
```

### Animating between triggers

Wrap one direct content element with `rdxPopoverViewport` to animate content changes when a popup
moves between triggers. The viewport exposes `data-activation-direction` and retains a
`data-previous` snapshot until its CSS transition or animation completes.

```typescript
import { Component } from '@angular/core';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
  selector: 'rdx-popover-viewport',
  imports: [...popoverImports],
  template: `
    <ng-container #root="rdxPopoverRoot" rdxPopoverRoot>
      <div class="flex flex-wrap justify-center gap-2">
        @for (item of items; track item.id) {
          <button [class]="cn(b.base, b.outline, b.size.sm)" [payload]="item" [id]="item.id" rdxPopoverTrigger>
            {{ item.label }}
          </button>
        }
      </div>

      <ng-template rdxPopoverPortalPresence>
        <div rdxPopoverPortal>
          <div class="transition-[left,right,top,bottom] duration-200" sideOffset="8" rdxPopoverPositioner>
            <div [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')" rdxPopoverPopup>
              <div class="relative" rdxPopoverViewport>
                <div
                  class="data-[previous]:animate-popover-viewport-out data-[current]:animate-popover-viewport-in data-[previous]:absolute data-[previous]:inset-0"
                >
                  <h2 [class]="p.title" rdxPopoverTitle>{{ root.payload()?.label }}</h2>
                  <p [class]="p.description" rdxPopoverDescription>
                    {{ root.payload()?.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `
})
export class RdxPopoverViewportComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly p = demoPopover;
  protected readonly items = [
    { id: 'notifications', label: 'Notifications', description: 'You are all caught up.' },
    { id: 'activity', label: 'Activity', description: 'Nothing interesting happened recently.' },
    { id: 'profile', label: 'Profile', description: 'Manage your profile settings and account preferences.' }
  ];
}
```

## API Reference

### Root

`RdxPopoverRoot` owns the open state and optional modal behavior.

### Trigger

`RdxPopoverTrigger` toggles the popover and exposes ARIA attributes.

### Portal

`RdxPopoverPortal` moves content to `document.body` by default or to a configured container.

### Positioner

`RdxPopoverPositioner` delegates placement and collision handling to the shared Popper primitive. Its
optional `anchor` input overrides the trigger only for positioning.

### Popup

`RdxPopoverPopup` owns dialog semantics, dismissal events, and focus lifecycle events.

### Viewport

`RdxPopoverViewport` coordinates direction-aware content transitions between multiple triggers.

### Arrow, Backdrop, Title, Description, and Close

These parts read their behavior and state from context and do not expose additional inputs or outputs.
