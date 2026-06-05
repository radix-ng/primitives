import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-swipe-to-open',
    imports: [...drawerImports],
    template: `
        <div class="border-border bg-muted/40 relative h-72 w-full max-w-md overflow-hidden rounded-xl border">
            <div rdxDrawerRoot>
                <p class="text-muted-foreground p-4 text-sm">
                    Swipe up from the highlighted strip at the bottom to open the drawer (or use the button).
                </p>

                <button [class]="cn(b.base, b.outline, b.size.sm, 'ml-4')" rdxDrawerTrigger>Open</button>

                <!-- Edge strip: swiping inward opens the drawer. -->
                <div
                    class="bg-primary/15 absolute inset-x-0 bottom-0 h-8 cursor-grab touch-none data-[swiping]:cursor-grabbing"
                    rdxDrawerSwipeArea
                ></div>

                <ng-template rdxDrawerPortalPresence>
                    <div rdxDrawerPortal>
                        <div [class]="d.backdrop" rdxDrawerBackdrop></div>

                        <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                            <div [class]="d.grip" aria-hidden="true"></div>
                            <div [class]="d.body" rdxDrawerContent>
                                <h2 [class]="d.title" rdxDrawerTitle>Opened by swipe</h2>
                                <p [class]="d.description" rdxDrawerDescription>Swipe back down to dismiss.</p>
                                <div [class]="d.footer">
                                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerSwipeToOpenComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
