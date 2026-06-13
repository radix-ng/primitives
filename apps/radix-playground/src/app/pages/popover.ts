import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { DemoPage } from '../shared/demo-page';
import { cn, demoButton, demoInput, demoPopover } from '../shared/styles';

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
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>
                    <svg aria-hidden="true" lucidePlus size="16"></svg>
                    Add details
                </button>

                <div *rdxPopoverPortal [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                    <div [class]="p.popup" rdxPopoverPopup>
                        <span [class]="p.arrow" rdxPopoverArrow></span>
                        <h2 [class]="p.title" rdxPopoverTitle>Dimensions</h2>
                        <p [class]="p.description" rdxPopoverDescription>Set the width and height for the element.</p>

                        <div class="mt-4 grid gap-3">
                            <label class="text-foreground grid gap-1 text-xs font-medium">
                                Width
                                <input [class]="input" value="100%" />
                            </label>
                            <label class="text-foreground grid gap-1 text-xs font-medium">
                                Max width
                                <input [class]="input" value="300px" />
                            </label>
                        </div>

                        <button [class]="p.close" aria-label="Close" rdxPopoverClose>
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
