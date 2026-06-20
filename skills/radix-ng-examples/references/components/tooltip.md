# Tooltip

#### Displays contextual information when a trigger is hovered or focused.

Tooltip composes the shared Popper, structural Portal (portal + presence), and Dismissable Layer
primitives. It remains headless: styles and native CSS animations belong to the consumer. The API
follows Base UI.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-default',
    imports: [...tooltipImports, LucidePlus],
    template: `
        <ng-container rdxTooltip>
            <button [class]="cn(b.base, b.outline, b.size.icon)" aria-label="Add to library" rdxTooltipTrigger>
                <svg aria-hidden="true" lucidePlus size="16" />
            </button>

            <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                <div [class]="t.popup" rdxTooltipPopup>Add to library</div>
                <span [class]="t.arrow" rdxTooltipArrow></span>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;
}
```

## Features

- ✅ Opens on hover and keyboard focus, closes on blur, pointer leave, click, or Escape.
- ✅ Configurable open `delay`, `closeDelay`, and an instant-open `timeout` window.
- ✅ A `Provider` shares delays and the instant-open window across a group of tooltips.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Supports multiple and detached triggers through a `Handle`.
- ✅ Can follow the cursor with `trackCursorAxis`.
- ✅ Positions content with the shared Floating UI-based Popper, with an optional custom `anchor`.
- ✅ Exposes `data-open`, `data-closed`, `data-side`, `data-align`, and a `data-instant` reason (`delay` / `dismiss` / `focus` / `tracking-cursor`) for styling.
- ✅ Keeps portal content mounted while CSS exit keyframes finish.

## Import

```typescript
import {
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
```

Or import all parts through the array:

```typescript
import { tooltipImports } from '@radix-ng/primitives/tooltip';
```

## Anatomy

Apply the parts to your own markup. `rdxTooltipPortal` is a **structural** directive: it teleports its
content into `document.body` while the tooltip is open and keeps it mounted until any closed-state CSS
exit keyframes on its root element finish. Use the `*` microsyntax on the positioner (or the explicit
`<ng-template rdxTooltipPortal>` form with `[container]` for a custom portal target):

```html
<ng-container rdxTooltip>
    <button rdxTooltipTrigger>+</button>

    <div *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
        <div rdxTooltipPopup>Add to library</div>
        <span rdxTooltipArrow></span>
    </div>
</ng-container>
```

`rdxTooltipPositioner` owns positioning and exposes `data-side` / `data-align` plus the `--anchor-*`,
`--available-*`, and `--transform-origin` CSS variables. `rdxTooltipPopup` carries `role="tooltip"`.

## Examples

### Default

A tooltip anchored to an icon button, with an arrow.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-default',
    imports: [...tooltipImports, LucidePlus],
    template: `
        <ng-container rdxTooltip>
            <button [class]="cn(b.base, b.outline, b.size.icon)" aria-label="Add to library" rdxTooltipTrigger>
                <svg aria-hidden="true" lucidePlus size="16" />
            </button>

            <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                <div [class]="t.popup" rdxTooltipPopup>Add to library</div>
                <span [class]="t.arrow" rdxTooltipArrow></span>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;
}
```

### Provider

Wrap a group of tooltips with `rdxTooltipProvider` to share the open `delay`, `closeDelay`, and the
instant-open `timeout` window — once one tooltip opens, adjacent ones open instantly until `timeout`
ms after the last one closes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-provider',
    imports: [...tooltipImports, LucideDynamicIcon],
    template: `
        <div class="flex items-center gap-2" [delay]="600" [timeout]="400" rdxTooltipProvider>
            @for (action of actions; track action.name) {
                <ng-container rdxTooltip>
                    <button
                        [class]="cn(b.base, b.outline, b.size.icon)"
                        [attr.aria-label]="action.name"
                        rdxTooltipTrigger
                    >
                        <svg [lucideIcon]="action.icon" aria-hidden="true" size="16" />
                    </button>

                    <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>{{ action.name }}</div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipProviderComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly actions = [
        { name: 'Bold', icon: 'bold' },
        { name: 'Italic', icon: 'italic' },
        { name: 'Add', icon: 'plus' }
    ];
}
```

### Per-trigger delay

Set `delay` (and `closeDelay`) on `rdxTooltipTrigger` to override the root, provider, and global
values for that trigger only.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-delay',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.delay) {
                <ng-container rdxTooltip>
                    <button [class]="cn(b.base, b.outline, b.size.md)" [delay]="item.delay" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>Opened after {{ item.delay }} ms</div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDelayComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly triggers = [
        { label: 'Instant', delay: 0 },
        { label: 'Default', delay: 600 },
        { label: 'Slow', delay: 1200 }
    ];
}
```

### Disabled trigger

Set `disabled` on `rdxTooltipTrigger` (or `disabled` on `rdxTooltip` for all triggers). A disabled
trigger never opens the tooltip and reflects `data-trigger-disabled`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-disabled',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.label) {
                <ng-container rdxTooltip>
                    <button [class]="cn(b.base, b.outline, b.size.md)" [disabled]="item.disabled" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div *rdxTooltipPortal [class]="t.positioner" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>{{ item.label }} tooltip</div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly triggers = [
        { label: 'Enabled', disabled: false },
        { label: 'Disabled', disabled: true }
    ];
}
```

### Tracking the cursor

Set `trackCursorAxis` on the root to `'x'`, `'y'`, or `'both'` to make the popup follow the pointer
along that axis.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-track-cursor',
    imports: [...tooltipImports],
    template: `
        <ng-container rdxTooltip trackCursorAxis="both">
            <button
                class="border-border bg-background text-foreground hover:bg-muted flex h-24 w-64 items-center justify-center rounded-md border text-sm shadow-sm outline-none"
                type="button"
                rdxTooltipTrigger
            >
                Move the cursor over me
            </button>

            <div *rdxTooltipPortal [class]="t.positioner" sideOffset="12" rdxTooltipPositioner>
                <div [class]="t.popup" rdxTooltipPopup>Following the cursor</div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipTrackCursorComponent {
    protected readonly t = demoTooltip;
}
```

### Moving anchors

Tooltip uses `updatePositionStrategy="always"` so it can follow moving triggers — keep that strategy
when the trigger moves continuously, such as a slider thumb being dragged.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-slider',
    imports: [
        ...tooltipImports,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div class="relative w-52 select-none" [value]="45" [step]="5" rdxSliderRoot>
            <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                    <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>

                    <ng-container [open]="showTooltipState()" rdxTooltip disabled>
                        <div
                            class="border-border bg-background focus-within:ring-ring focus-within:ring-offset-background block size-5 rounded-full border shadow-sm focus-within:ring-2 focus-within:ring-offset-2"
                            [rdxOnPointerDown]="handlePointerDown"
                            rdxSliderThumb
                            rdxTooltipTrigger
                        >
                            <input rdxSliderThumbInput aria-label="Volume" />
                        </div>

                        <div
                            *rdxTooltipPortal
                            [class]="t.positioner"
                            sideOffset="8"
                            side="top"
                            updatePositionStrategy="always"
                            rdxTooltipPositioner
                        >
                            <div [class]="t.popup" rdxTooltipPopup>Volume</div>
                        </div>
                    </ng-container>
                </div>
            </div>
        </div>
    `
})
export class RdxTooltipSliderComponent {
    protected readonly t = demoTooltip;

    readonly showTooltipState = signal(false);

    handlePointerDown = () => {
        this.showTooltipState.set(true);

        const handlePointerUp = () => {
            this.showTooltipState.set(false);

            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointerup', handlePointerUp);

        return;
    };
}
```

## API Reference

### Root

`RdxTooltip` owns the open state, delays, cursor tracking, and detached-trigger association.

### Provider

`RdxTooltipProvider` shares delays and the instant-open window across a group of tooltips.

### Trigger

`RdxTooltipTrigger` anchors the tooltip and exposes its open state through `data-popup-open`.

**Data attributes**

| Attribute                | Present when                              |
| ------------------------ | ---------------------------------------- |
| `data-popup-open`        | This trigger's tooltip is open.          |
| `data-trigger-disabled`  | The trigger is disabled.                 |

`aria-describedby` points at the popup's id only while the tooltip is open (the popup exists only then).

### Portal

`RdxTooltipPortal` is a structural directive (`*rdxTooltipPortal` or `<ng-template rdxTooltipPortal>`)
that teleports content to `document.body` by default. Pass `[container]` on the explicit
`<ng-template>` form to portal into a different element.

### Positioner

`RdxTooltipPositioner` delegates placement and collision handling to the shared Popper primitive. Its
optional `anchor` input overrides the trigger only for positioning.

**Data attributes**

| Attribute            | Present when / value                                                       |
| -------------------- | ------------------------------------------------------------------------- |
| `data-open`          | The tooltip is open.                                                       |
| `data-closed`        | The tooltip is closed.                                                     |
| `data-side`          | Resolved side after collision handling — `top` / `right` / `bottom` / `left`. |
| `data-align`         | Resolved alignment — `start` / `center` / `end`.                          |
| `data-anchor-hidden` | The anchor is clipped/off-screen and the popup is hidden.                 |

**CSS variables**

| Variable                                   | Description                                            |
| ------------------------------------------ | ----------------------------------------------------- |
| `--anchor-width` / `--anchor-height`       | Size of the anchor (trigger).                         |
| `--available-width` / `--available-height` | Space available before the collision boundary.        |
| `--transform-origin`                       | Origin to scale/zoom the popup from, based on side/align. |

### Popup

`RdxTooltipPopup` carries `role="tooltip"` and reads its state from context.

**Data attributes**

| Attribute      | Present when / value                                                        |
| -------------- | -------------------------------------------------------------------------- |
| `data-open`    | The tooltip is open.                                                        |
| `data-closed`  | The tooltip is closed.                                                      |
| `data-side`    | Resolved side — `top` / `right` / `bottom` / `left`.                        |
| `data-align`   | Resolved alignment — `start` / `center` / `end`.                            |
| `data-instant` | The open/close was instant — `delay` / `dismiss` / `focus` / `tracking-cursor`. |

### Arrow

`RdxTooltipArrow` reads its placement from context and points the popup at the anchor.

**Data attributes**

| Attribute         | Present when / value                                                        |
| ----------------- | -------------------------------------------------------------------------- |
| `data-open`       | The tooltip is open.                                                        |
| `data-closed`     | The tooltip is closed.                                                      |
| `data-side`       | Resolved side — `top` / `right` / `bottom` / `left`.                        |
| `data-align`      | Resolved alignment — `start` / `center` / `end`.                            |
| `data-instant`    | The open/close was instant — `delay` / `dismiss` / `focus` / `tracking-cursor`. |
| `data-uncentered` | The arrow was shifted from center to stay within the popup.                 |

## Accessibility

### Keyboard Interactions

| Key                     | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `Tab` / `Shift` + `Tab` | Moves focus onto the trigger (opening the tooltip) or away from it (closing it). |
| `Escape`                | Closes the open tooltip.                                                     |
