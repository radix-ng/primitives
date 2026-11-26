# Toggle Group — Default

> One example from the [Toggle Group](../components/toggle-group.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideTextAlignCenter, LucideTextAlignEnd, LucideTextAlignStart } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'toggle-group-default-example',
    imports: [RdxToggle, RdxToggleGroup, LucideTextAlignStart, LucideTextAlignCenter, LucideTextAlignEnd],
    template: `
        <div
            class="border-foreground flex gap-px border p-px"
            [defaultValue]="['center']"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button
                class="demo-button demo-button-ghost data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:hover:bg-primary relative size-8 focus-visible:z-1 focus-visible:outline-offset-1"
                rdxToggle
                value="left"
                aria-label="Left aligned"
            >
                <svg lucideTextAlignStart size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-button-ghost data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:hover:bg-primary relative size-8 focus-visible:z-1 focus-visible:outline-offset-1"
                rdxToggle
                value="center"
                aria-label="Center aligned"
            >
                <svg lucideTextAlignCenter size="16" aria-hidden="true"></svg>
            </button>
            <button
                class="demo-button demo-button-ghost data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:hover:bg-primary relative size-8 focus-visible:z-1 focus-visible:outline-offset-1"
                rdxToggle
                value="right"
                aria-label="Right aligned"
            >
                <svg lucideTextAlignEnd size="16" aria-hidden="true"></svg>
            </button>
        </div>
    `
})
export class ToggleGroupDefaultExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` for the icons.
