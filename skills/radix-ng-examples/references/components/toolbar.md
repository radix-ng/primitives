# Toolbar

#### A container for grouping a set of controls, such as buttons, toggle groups or menus.

```html
<div class="${rootClass}" rdxToolbarRoot aria-label="Formatting options">
    <div class="flex gap-1" rdxToggleGroupWithoutFocus multiple aria-label="Text formatting">
        <button class="${toggleClass}" rdxToggle value="bold" aria-label="Bold">
            <svg lucideBold size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="italic" aria-label="Italic">
            <svg lucideItalic size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="underline" aria-label="Underline">
            <svg lucideUnderline size="16"></svg>
        </button>
    </div>

    <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>

    <div class="flex gap-1" rdxToggleGroupWithoutFocus [value]="alignment" aria-label="Text alignment">
        <button class="${toggleClass}" rdxToggle value="left" aria-label="Align left">
            <svg lucideAlignLeft size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="center" aria-label="Align center">
            <svg lucideAlignCenter size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="right" aria-label="Align right">
            <svg lucideAlignRight size="16"></svg>
        </button>
    </div>

    <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>

    <a class="${linkClass}" href="#" rdxToolbarLink>Edited 2h ago</a>
    <button
        class="${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90 ml-2"
        rdxToolbarButton
    >
        Share
    </button>
</div>
```

## Features

- ✅ Full keyboard navigation with composite focus.
- ✅ Horizontal and vertical orientation.
- ✅ Disabling the toolbar or a group cascades to its items.
- ✅ Composes with Toggle Group, Menu, Tooltip, NumberField and more.

## Import

```typescript
import {
    RdxToolbarRoot,
    RdxToolbarButton,
    RdxToolbarLink,
    RdxToolbarInput,
    RdxToolbarGroup,
    RdxToolbarSeparator
} from '@radix-ng/primitives/toolbar';
```

The API follows [Base UI Toolbar](https://base-ui.com/react/components/toolbar): a `Root` owning
composite focus over `Button`, `Link`, `Input`, `Group` and `Separator` parts.

## Anatomy

```html
<div rdxToolbarRoot>
    <div rdxToolbarGroup>
        <button rdxToolbarButton></button>
        <button rdxToolbarButton></button>
    </div>
    <div rdxToolbarSeparator></div>
    <input rdxToolbarInput />
    <a rdxToolbarLink></a>
</div>
```

Stack a toolbar part on another primitive's trigger/input to compose it — e.g.
`<button rdxToolbarButton rdxMenuTrigger>` or `<input rdxToolbarInput rdxNumberFieldInput>`.
Use `rdxToggleGroupWithoutFocus` for toggle groups inside a toolbar so the toggles share the toolbar's
composite focus. Disabled state from `rdxToolbarRoot` or `rdxToolbarGroup` cascades into those toggle
groups and their items.

## Examples

### Vertical

Set `orientation="vertical"` to lay the toolbar out vertically (arrow navigation switches to Up/Down).

```html
<div
    class="${rootClass} flex-col items-stretch"
    rdxToolbarRoot
    orientation="vertical"
    aria-label="Formatting options"
>
    <div
        class="flex flex-col gap-1"
        rdxToggleGroupWithoutFocus
        [value]="alignment"
        aria-label="Text alignment"
    >
        <button class="${toggleClass}" rdxToggle value="left" aria-label="Align left">
            <svg lucideAlignLeft size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="center" aria-label="Align center">
            <svg lucideAlignCenter size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="right" aria-label="Align right">
            <svg lucideAlignRight size="16"></svg>
        </button>
    </div>
    <div class="bg-border mx-1 my-1 h-px" rdxToolbarSeparator orientation="horizontal"></div>
    <button class="${buttonClass}" rdxToolbarButton>Share</button>
</div>
```

### Disabled

A disabled `[rdxToolbarButton]` stays focusable by default (`focusableWhenDisabled`) so keyboard and
screen-reader users can still reach it.

```html
<div class="${rootClass}" rdxToolbarRoot aria-label="Formatting options">
    <button class="${buttonClass}" rdxToolbarButton>Bold</button>
    <button class="${buttonClass}" rdxToolbarButton disabled>Italic</button>
    <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>
    <button class="${buttonClass}" rdxToolbarButton>Underline</button>
</div>
```

### Using with Menu

Render a `[rdxMenuTrigger]` on a toolbar button to open a menu from the toolbar.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { toolbarImports } from '@radix-ng/primitives/toolbar';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-menu',
    imports: [...toolbarImports, RdxMenuModule, LucideChevronDown],
    template: `
        <div
            class="border-border bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm"
            rdxToolbarRoot
            aria-label="Toolbar with menu"
        >
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Italic
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
                <button
                    class="text-foreground hover:bg-muted focus-visible:ring-ring data-[popup-open]:bg-muted inline-flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxToolbarButton
                    rdxMenuTrigger
                >
                    More
                    <svg lucideChevronDown size="14"></svg>
                </button>

                @if (menu.open()) {
                    <div [class]="m.positioner" sideOffset="6" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            <button [class]="m.item" rdxMenuItem>Undo</button>
                            <button [class]="m.item" rdxMenuItem>Redo</button>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <button [class]="m.item" rdxMenuItem>Clear formatting</button>
                        </div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
export class ToolbarWithMenuExample {
    protected readonly cn = cn;
    protected readonly m = demoMenu;
}
```

### Using with Tooltip

Wrap toolbar buttons with a tooltip by stacking `[rdxTooltipTrigger]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBold, LucideItalic } from '@lucide/angular';
import { toolbarImports } from '@radix-ng/primitives/toolbar';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

const itemClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-tooltip',
    imports: [...toolbarImports, ...tooltipImports, LucideBold, LucideItalic],
    template: `
        <div
            class="border-border bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm"
            rdxToolbarRoot
            aria-label="Toolbar with tooltips"
        >
            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Bold" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideBold size="16"></svg>
                </button>
                <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                    <div [class]="t.popup" rdxTooltipPopup>Bold</div>
                    <span [class]="t.arrow" rdxTooltipArrow></span>
                </div>
            </ng-container>

            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Italic" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideItalic size="16"></svg>
                </button>
                <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                    <div [class]="t.popup" rdxTooltipPopup>Italic</div>
                    <span [class]="t.arrow" rdxTooltipArrow></span>
                </div>
            </ng-container>
        </div>
    `
})
export class ToolbarWithTooltipExample {
    protected readonly t = demoTooltip;
}
```

### Using with NumberField

Stack `[rdxToolbarInput]` on a `[rdxNumberFieldInput]` to embed a number field. The input keeps native
text editing — the arrow keys move the caret and only move toolbar focus once the caret reaches the
matching edge.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideMinus, LucidePlus } from '@lucide/angular';
import { RdxNumberFieldModule } from '@radix-ng/primitives/number-field';
import { toolbarImports } from '@radix-ng/primitives/toolbar';

const stepClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 disabled:opacity-50';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-number-field',
    imports: [...toolbarImports, RdxNumberFieldModule, LucideMinus, LucidePlus],
    template: `
        <div
            class="border-border bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm"
            rdxToolbarRoot
            aria-label="Toolbar with number field"
        >
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <div
                class="flex items-center gap-0.5"
                [value]="16"
                rdxNumberFieldRoot
                min="8"
                max="72"
                aria-label="Font size"
            >
                <button class="${stepClass}" aria-label="Decrease" rdxToolbarButton rdxNumberFieldDecrement>
                    <svg lucideMinus size="16"></svg>
                </button>
                <input
                    class="border-border bg-background text-foreground focus-visible:ring-ring h-8 w-12 rounded-md border text-center text-sm outline-none focus-visible:ring-2"
                    rdxToolbarInput
                    rdxNumberFieldInput
                />
                <button class="${stepClass}" aria-label="Increase" rdxToolbarButton rdxNumberFieldIncrement>
                    <svg lucidePlus size="16"></svg>
                </button>
            </div>
        </div>
    `
})
export class ToolbarWithNumberFieldExample {}
```

## API Reference

### ToolbarRoot

`RdxToolbarRoot`

| Data attribute       | Value                        |
| -------------------- | ---------------------------- |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]`    | Present when disabled.       |

### ToolbarButton

`RdxToolbarButton`

| Data attribute       | Value                                       |
| -------------------- | ------------------------------------------- |
| `[data-orientation]` | `"horizontal" \| "vertical"`                |
| `[data-disabled]`    | Present when disabled.                      |
| `[data-focusable]`   | Present when focusable while disabled.      |

### ToolbarInput

`RdxToolbarInput`

| Data attribute       | Value                                       |
| -------------------- | ------------------------------------------- |
| `[data-orientation]` | `"horizontal" \| "vertical"`                |
| `[data-disabled]`    | Present when disabled.                      |
| `[data-focusable]`   | Present when focusable while disabled.      |

### ToolbarGroup

`RdxToolbarGroup`

| Data attribute       | Value                        |
| -------------------- | ---------------------------- |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]`    | Present when disabled.       |

### ToolbarLink

`RdxToolbarLink` — an `<a>` toolbar item; reads everything from context. Exposes `[data-orientation]`.

### ToolbarSeparator

`RdxToolbarSeparator` — composes the Separator primitive; defaults to the opposite of the toolbar
orientation and accepts `orientation` to override it.

## Accessibility

Adheres to the [Toolbar WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

### Keyboard Interactions

| Key          | Description                                        |
| ------------ | -------------------------------------------------- |
| `Tab`        | Moves focus into/out of the toolbar through the current item. |
| `ArrowRight` | (Horizontal) Moves focus to the next item.         |
| `ArrowLeft`  | (Horizontal) Moves focus to the previous item.     |
| `ArrowDown`  | (Vertical) Moves focus to the next item.           |
| `ArrowUp`    | (Vertical) Moves focus to the previous item.       |
| `Home`       | Moves focus to the first item.                     |
| `End`        | Moves focus to the last item.                      |
