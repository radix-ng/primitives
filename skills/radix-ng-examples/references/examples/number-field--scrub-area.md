# Number Field — Scrub Area

> One example from the [Number Field](../components/number-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Drag the label horizontally to change the value; a virtual cursor follows the pointer.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    LucideDynamicIcon,
    LucideMinus as Minus,
    LucideMoveHorizontal as Move,
    LucidePlus as Plus
} from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot,
    RdxNumberFieldScrubArea,
    RdxNumberFieldScrubAreaCursor
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-scrub-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement,
        RdxNumberFieldScrubArea,
        RdxNumberFieldScrubAreaCursor
    ],
    template: `
        <div class="flex flex-col gap-1.5" [id]="'scrub'" [defaultValue]="0" rdxNumberFieldRoot>
            <div
                class="text-foreground flex w-fit cursor-ew-resize items-center gap-1.5 text-sm font-medium select-none"
                rdxNumberFieldScrubArea
            >
                <svg class="flex" [lucideIcon]="Move" size="16" />
                <label for="scrub">Drag to scrub</label>
                <span class="text-popover-foreground" rdxNumberFieldScrubAreaCursor>
                    <svg class="flex" [lucideIcon]="Move" size="20" />
                </span>
            </div>
            <div
                class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                rdxNumberFieldGroup
            >
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldDecrement
                >
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input
                    class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldScrubExample {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
    protected readonly Move = Move;
}
```
