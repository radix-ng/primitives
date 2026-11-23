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
import { LucideInfo, LucideX } from '@lucide/angular';
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
        LucideInfo,
        LucideX
    ],
    template: `
        <ng-container rdxPopoverRoot>
            <button
                class="demo-button demo-button-outline data-popup-open:bg-muted size-8 active:bg-neutral-200 dark:active:bg-neutral-700"
                type="button"
                aria-label="Shipping information"
                rdxPopoverTrigger
            >
                <svg aria-hidden="true" lucideInfo size="16" />
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                <div
                    class="demo-popup relative flex max-w-[min(500px,var(--available-width))] origin-(--transform-origin) flex-col gap-1 p-3 transition-[scale,opacity] duration-100 ease-out outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none"
                    rdxPopoverPopup
                >
                    <span class="block h-1.5 w-3" rdxPopoverArrow><span class="demo-popup-arrow"></span></span>
                    <h2 class="pe-8 text-sm font-bold" rdxPopoverTitle>Free shipping</h2>
                    <p class="text-muted-foreground text-sm" id="shipping-policy" rdxPopoverDescription>
                        Orders over $50 arrive in 3–5 business days at no extra cost.
                    </p>
                    <a
                        class="demo-focus self-start text-sm underline underline-offset-2 hover:no-underline"
                        href="#shipping-policy"
                    >
                        View shipping policy
                    </a>
                    <button
                        class="demo-button demo-button-ghost absolute inset-e-2 top-2 size-7 p-0"
                        type="button"
                        aria-label="Close"
                        rdxPopoverClose
                    >
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverDefaultComponent {}
```

The shared stylesheet and setup instructions below apply to every example on this page.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
