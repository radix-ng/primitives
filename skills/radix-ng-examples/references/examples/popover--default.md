# Popover — Default

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A form-like popup with an arrow, accessible title and description, and a close button.

In an Angular app with Tailwind CSS v4, [install Radix NG](../overview/installation.md)
and add `@lucide/angular` for the icons. Copy the component from **Show code**, add
`RdxPopoverDefaultComponent` to the parent component's `imports` and use `<rdx-popover-default />`
in its template.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-popover-default',
    imports: [
        RdxPopoverArrow,
        RdxPopoverClose,
        RdxPopoverDescription,
        RdxPopoverPopup,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverRoot,
        RdxPopoverTitle,
        RdxPopoverTrigger,
        LucidePlus,
        LucideX
    ],
    template: `
        <ng-container rdxPopoverRoot>
            <button class="demo-button demo-button-outline h-9 px-4" type="button" rdxPopoverTrigger>
                <svg aria-hidden="true" lucidePlus size="16" />
                Add details
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                <div
                    class="demo-surface data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 p-4"
                    rdxPopoverPopup
                >
                    <span class="demo-arrow text-card my-px" rdxPopoverArrow></span>
                    <h2 class="text-popover-foreground text-sm font-semibold" rdxPopoverTitle>Dimensions</h2>
                    <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                        Set the width and height for the element.
                    </p>

                    <div class="mt-4 grid gap-3">
                        @for (field of fields; track field.label) {
                            <label class="grid gap-1 text-xs font-medium">
                                {{ field.label }}
                                <input class="demo-input h-9 w-full px-3" [value]="field.value" />
                            </label>
                        }
                    </div>

                    <button
                        class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                        type="button"
                        aria-label="Close"
                        rdxPopoverClose
                    >
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverDefaultComponent {
    protected readonly fields = [
        { label: 'Width', value: '100%' },
        { label: 'Max width', value: '300px' }
    ];
}
```

The shared stylesheet and setup instructions below apply to every example on this page.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
