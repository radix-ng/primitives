import { Component } from '@angular/core';
import { createRdxPopoverHandle, popoverImports } from '@radix-ng/primitives/popover';
import { LucideAngularModule } from 'lucide-angular';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-popover-detached',
    imports: [...popoverImports, LucideAngularModule],
    template: `
        <div class="flex w-[min(640px,80vw)] flex-col items-center gap-8">
            <div class="flex w-full justify-between gap-4">
                <button id="account" [class]="cn(b.base, b.outline, b.size.md)" [handle]="popover" rdxPopoverTrigger>
                    Account trigger
                </button>

                <button id="billing" [class]="cn(b.base, b.outline, b.size.md)" [handle]="popover" rdxPopoverTrigger>
                    Billing trigger
                </button>
            </div>

            <div class="flex flex-wrap justify-center gap-2">
                <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="popover.open('account')">
                    Open account
                </button>
                <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="popover.open('billing')">
                    Open billing
                </button>
                <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="popover.close()">Close</button>
            </div>

            <ng-container [handle]="popover" rdxPopoverRoot>
                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                            <div [class]="p.popup" rdxPopoverPopup>
                                <span [class]="p.arrow" rdxPopoverArrow></span>
                                <h2 [class]="p.title" rdxPopoverTitle>Detached handles</h2>
                                <p [class]="p.description" rdxPopoverDescription>
                                    Both triggers live outside the root. Open another trigger to move this popup without
                                    closing it first.
                                </p>
                                <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                                    <lucide-angular aria-hidden="true" name="x" size="14" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly popover = createRdxPopoverHandle();
}
