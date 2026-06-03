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
        <div class="flex flex-col gap-1.5" rdxNumberFieldRoot [id]="'scrub'" [defaultValue]="0">
            <div
                class="text-foreground flex w-fit cursor-ew-resize items-center gap-1.5 text-sm font-medium select-none"
                rdxNumberFieldScrubArea
            >
                <svg class="flex" size="16" [lucideIcon]="Move" />
                <label for="scrub">Drag to scrub</label>
                <span class="text-popover-foreground" rdxNumberFieldScrubAreaCursor>
                    <svg class="flex" size="20" [lucideIcon]="Move" />
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
                    <svg class="flex" size="16" [lucideIcon]="Minus" />
                </button>
                <input
                    class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" size="16" [lucideIcon]="Plus" />
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
