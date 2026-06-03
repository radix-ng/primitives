import { DemoPage } from '../shared/demo-page';
import { cn, demoButton, demoInput, demoPopover } from '../shared/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    selector: 'app-popover',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DemoPage, ...popoverImports, LucidePlus, LucideX],
    template: `
        <demo-page
            title="Popover"
            description="Displays rich content in a portal, anchored to and triggered by a button."
        >
            <ng-container rdxPopoverRoot>
                <button rdxPopoverTrigger [class]="cn(b.base, b.outline, b.size.md)">
                    <svg aria-hidden="true" lucidePlus size="16"></svg>
                    Add details
                </button>

                <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner [class]="p.positioner">
                    <div rdxPopoverPopup [class]="p.popup">
                        <span rdxPopoverArrow [class]="p.arrow"></span>
                        <h2 rdxPopoverTitle [class]="p.title">Dimensions</h2>
                        <p rdxPopoverDescription [class]="p.description">Set the width and height for the element.</p>

                        <div class="mt-4 grid gap-3">
                            <label class="text-foreground grid gap-1 text-xs font-medium">
                                Width
                                <input value="100%" [class]="input" />
                            </label>
                            <label class="text-foreground grid gap-1 text-xs font-medium">
                                Max width
                                <input value="300px" [class]="input" />
                            </label>
                        </div>

                        <button aria-label="Close" rdxPopoverClose [class]="p.close">
                            <svg aria-hidden="true" lucideX size="14"></svg>
                        </button>
                    </div>
                </div>
            </ng-container>
        </demo-page>
    `
})
export default class PopoverPage {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly input = demoInput;
}
