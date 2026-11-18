# Popover — Default

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                type="button"
                rdxPopoverTrigger
            >
                <svg aria-hidden="true" lucidePlus size="16" />
                Add details
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                <div
                    class="demo-surface data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 p-4"
                    rdxPopoverPopup
                >
                    <span
                        class="text-card my-px fill-current drop-shadow-[0_1px_0_var(--color-border)]"
                        rdxPopoverArrow
                    ></span>
                    <h2 class="text-popover-foreground text-sm font-semibold" rdxPopoverTitle>Dimensions</h2>
                    <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                        Set the width and height for the element.
                    </p>

                    <div class="mt-4 grid gap-3">
                        @for (field of fields; track field.label) {
                            <label class="grid gap-1 text-xs font-medium">
                                {{ field.label }}
                                <input
                                    class="border-border bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                    [value]="field.value"
                                />
                            </label>
                        }
                    </div>

                    <button
                        class="text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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

Add the CSS below after `@import 'tailwindcss';` in your global stylesheet. It supplies the semantic
colors, shared surface and popup animations used by the component.

```css
@theme {
    /* Semantic colors shared by Tailwind demos */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-border: var(--border);
    --color-ring: var(--ring);
    --color-input: var(--border);
    --color-accent: var(--muted);
    --color-accent-foreground: var(--foreground);
    /* Distinct accent for search-match highlighting (e.g. fuzzy results). Stays available in demos
       (not reset in the [data-demo] block below), unlike the docs-only `--color-highlight`. */
    --color-match: var(--match);

    --animate-popover-popup-in: popover-popup-in 150ms ease-out;
    --animate-popover-popup-out: popover-popup-out 120ms ease-in forwards;
}

:root {
    --background: white;
    --foreground: oklch(14.5% 1% 264deg);
    --card: white;
    --card-foreground: var(--foreground);
    --popover: white;
    --popover-foreground: var(--foreground);
    --primary: oklch(20.5% 1% 264deg);
    --primary-foreground: white;
    --muted: oklch(96.5% 0.5% 264deg);
    --muted-foreground: oklch(46% 1% 264deg);
    --destructive: oklch(57.7% 0.245 27.325deg);
    --destructive-foreground: white;
    --border: oklch(90% 1% 264deg);
    --ring: oklch(55% 1% 264deg);
    --match: oklch(45% 50% 264deg);
}

:root[data-theme='dark'] {
    --background: oklch(14.5% 1% 264deg);
    --foreground: oklch(96% 0.5% 264deg);
    --card: oklch(18% 1% 264deg);
    --card-foreground: var(--foreground);
    --popover: oklch(18% 1% 264deg);
    --popover-foreground: var(--foreground);
    --primary: oklch(92% 0.5% 264deg);
    --primary-foreground: oklch(18% 1% 264deg);
    --muted: oklch(24% 1% 264deg);
    --muted-foreground: oklch(70% 1% 264deg);
    --destructive: oklch(70.4% 0.191 22.216deg);
    --destructive-foreground: oklch(18% 1% 264deg);
    --border: oklch(30% 1% 264deg);
    --ring: oklch(65% 1% 264deg);
    --match: oklch(69% 50% 264deg);
}

@layer components {
    .demo-surface {
        @apply bg-card text-card-foreground border-border rounded-md border shadow-sm;
    }
}

@keyframes popover-popup-in {
    from {
        opacity: 0;
        transform: translateY(-0.25rem) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes popover-popup-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    to {
        opacity: 0;
        transform: translateY(-0.25rem) scale(0.98);
    }
}
```
