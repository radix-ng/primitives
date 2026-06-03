import { Component, model } from '@angular/core';
import { LucideAlignCenter, LucideAlignLeft, LucideAlignRight } from '@lucide/angular';
import { RdxToggleGroupDirective, RdxToggleGroupItemDirective } from '@radix-ng/primitives/toggle-group';

@Component({
    selector: 'toggle-group',
    imports: [
        RdxToggleGroupDirective,
        RdxToggleGroupItemDirective,
        LucideAlignLeft,
        LucideAlignCenter,
        LucideAlignRight
    ],
    template: `
        <div
            class="border-border bg-muted inline-flex rounded-md border shadow-sm"
            [value]="align()"
            (onValueChange)="setAlign($event)"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button
                class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-l-md border border-transparent transition-[color,box-shadow] outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rdxToggleGroupItem
                value="left"
                aria-label="Left aligned"
            >
                <svg lucideAlignLeft size="12" />
            </button>
            <button
                class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-transparent transition-[color,box-shadow] outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rdxToggleGroupItem
                value="center"
                aria-label="Center aligned"
            >
                <svg lucideAlignCenter size="12" />
            </button>
            <button
                class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-r-md border border-transparent transition-[color,box-shadow] outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rdxToggleGroupItem
                value="right"
                aria-label="Right aligned"
            >
                <svg lucideAlignRight size="12" />
            </button>
        </div>

        <div>value of model: {{ align() }}</div>
    `
})
export class ToggleGroup {
    align = model<'right' | 'center' | 'left' | undefined>('right');

    setAlign(val: string | undefined) {
        this.align.set(val as 'right' | 'center' | 'left' | undefined);
    }
}
