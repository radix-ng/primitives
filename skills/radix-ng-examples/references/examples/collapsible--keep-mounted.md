# Collapsible — Keep mounted

> One example from the [Collapsible](../components/collapsible.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

With `keepMounted`, the closed panel stays in the DOM and receives `hidden` after the close
transition. During enter and exit, `data-starting-style` / `data-ending-style` can drive CSS motion.

```html
<div class="w-full max-w-sm" rdxCollapsibleRoot #collapsibleRoot="rdxCollapsibleRoot">
    <div class="flex items-center justify-between gap-3">
        <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
        <button
            class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border inline-flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-2"
            type="button"
            rdxCollapsibleTrigger
        >
            @if (collapsibleRoot.open()) {
            <svg class="flex" size="16" lucideX></svg>
            } @else {
            <svg class="flex" size="16" lucideUnfoldVertical></svg>
            }
        </button>
    </div>

    <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
        <span class="text-sm">&#64;radix-ui/primitives</span>
    </div>

    <div
        class="grid transition-[grid-template-rows] duration-300 ease-out data-[closed]:grid-rows-[0fr] data-[open]:grid-rows-[1fr]"
        rdxCollapsiblePanel
        [keepMounted]="true"
    >
        <div class="overflow-hidden">
            <div
                class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm"
            >
                <span class="text-sm">&#64;radix-ui/colors</span>
            </div>
            <div
                class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm"
            >
                <span class="text-sm">&#64;stitches/react</span>
            </div>
        </div>
    </div>
</div>
```
