import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { LucideAlignCenter, LucideAlignLeft, LucideAlignRight } from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toggle-group',
    imports: [RdxToggleGroup, RdxToggle, LucideAlignLeft, LucideAlignCenter, LucideAlignRight],
    template: `
        <div
            class="border-border bg-muted inline-flex rounded-md border shadow-sm"
            [(value)]="align"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button
                class="bg-background text-foreground hover:bg-muted data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-l-md border border-transparent transition-[color,box-shadow] outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rdxToggle
                value="left"
                aria-label="Left aligned"
            >
                <svg lucideAlignLeft size="12" />
            </button>
            <button
                class="bg-background text-foreground hover:bg-muted data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 cursor-pointer items-center justify-center border border-transparent transition-[color,box-shadow] outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rdxToggle
                value="center"
                aria-label="Center aligned"
            >
                <svg lucideAlignCenter size="12" />
            </button>
            <button
                class="bg-background text-foreground hover:bg-muted data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-r-md border border-transparent transition-[color,box-shadow] outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                rdxToggle
                value="right"
                aria-label="Right aligned"
            >
                <svg lucideAlignRight size="12" />
            </button>
        </div>

        <div class="text-muted-foreground mt-3 text-sm">value: [{{ align().join(', ') }}]</div>
    `
})
export class ToggleGroup {
    readonly align = model<string[]>(['right']);
}
