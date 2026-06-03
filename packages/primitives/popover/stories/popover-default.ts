import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-default',
    imports: [...popoverImports, LucidePlus, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)">
                <svg aria-hidden="true" lucidePlus size="16" />
                Add details
            </button>

            <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner [class]="p.positioner">
                <div rdxPopoverPopup [class]="p.popup">
                    <span rdxPopoverArrow [class]="p.arrow"></span>
                    <h2 rdxPopoverTitle [class]="p.title">Dimensions</h2>
                    <p rdxPopoverDescription [class]="p.description">Set the width and height for the element.</p>

                    <div class="mt-4 grid gap-3">
                        <label class="grid gap-1 text-xs font-medium">
                            Width
                            <input value="100%" [class]="input" />
                        </label>
                        <label class="grid gap-1 text-xs font-medium">
                            Max width
                            <input value="300px" [class]="input" />
                        </label>
                    </div>

                    <button aria-label="Close" rdxPopoverClose [class]="p.close">
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly input = demoInput;
    protected readonly p = demoPopover;
}
