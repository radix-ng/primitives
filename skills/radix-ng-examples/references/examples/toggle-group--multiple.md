# Toggle Group — Multiple

> One example from the [Toggle Group](../components/toggle-group.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Set `multiple` to allow more than one item to be pressed at the same time.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    LucideBold,
    LucideItalic,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
    LucideTextAlignStart,
    LucideUnderline
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-group-multiple-example',
    imports: [RdxToggle, RdxToggleGroup, LucideBold, LucideItalic, LucideUnderline],
    template: `
        <div
            class="border-foreground inline-flex gap-px border p-px"
            [defaultValue]="['bold', 'italic']"
            rdxToggleGroup
            multiple
            aria-label="Text formatting"
        >
            <button class="demo-button demo-toolbar-pressable size-8" rdxToggle value="bold" aria-label="Bold">
                <svg class="flex" lucideBold size="16" aria-hidden="true"></svg>
            </button>
            <button class="demo-button demo-toolbar-pressable size-8" rdxToggle value="italic" aria-label="Italic">
                <svg class="flex" lucideItalic size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="underline"
                aria-label="Underline"
            >
                <svg class="flex" lucideUnderline size="16" aria-hidden="true"></svg>
            </button>
        </div>
    `
})
export class ToggleGroupMultipleExample {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-group-disabled-item-example',
    imports: [RdxToggle, RdxToggleGroup, LucideTextAlignStart, LucideTextAlignCenter, LucideTextAlignEnd],
    template: `
        <div
            class="border-foreground inline-flex gap-px border p-px"
            [defaultValue]="['center']"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="left"
                disabled
                aria-label="Left aligned"
            >
                <svg class="flex" lucideTextAlignStart size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="center"
                aria-label="Center aligned"
            >
                <svg class="flex" lucideTextAlignCenter size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="right"
                aria-label="Right aligned"
            >
                <svg class="flex" lucideTextAlignEnd size="16" aria-hidden="true"></svg>
            </button>
        </div>
    `
})
export class ToggleGroupDisabledItemExample {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-group-disabled-example',
    imports: [RdxToggle, RdxToggleGroup, LucideTextAlignStart, LucideTextAlignCenter, LucideTextAlignEnd],
    template: `
        <div
            class="border-foreground inline-flex gap-px border p-px"
            [defaultValue]="['center']"
            rdxToggleGroup
            disabled
            aria-label="Text alignment"
        >
            <button class="demo-button demo-toolbar-pressable size-8" rdxToggle value="left" aria-label="Left aligned">
                <svg class="flex" lucideTextAlignStart size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="center"
                aria-label="Center aligned"
            >
                <svg class="flex" lucideTextAlignCenter size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-toolbar-pressable size-8"
                rdxToggle
                value="right"
                aria-label="Right aligned"
            >
                <svg class="flex" lucideTextAlignEnd size="16" aria-hidden="true"></svg>
            </button>
        </div>
    `
})
export class ToggleGroupDisabledExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` for the icons.
