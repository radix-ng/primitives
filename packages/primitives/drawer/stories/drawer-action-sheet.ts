import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

/** A full-width action-sheet row. */
const action = cn(
    'block w-full px-4 py-3 text-center text-sm text-foreground',
    'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
);

@Component({
    selector: 'rdx-drawer-action-sheet',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Photo options</button>

            <ng-template rdxDrawerPortalPresence>
                <div [class]="d.portalAnimated" rdxDrawerPortal>
                    <div [class]="d.backdrop" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div class="overflow-y-auto pb-2" rdxDrawerContent>
                            <h2 class="sr-only" rdxDrawerTitle>Photo options</h2>
                            <p class="text-muted-foreground px-6 py-3 text-center text-xs" rdxDrawerDescription>
                                Choose an action for this photo
                            </p>

                            <!-- Primary group of actions. -->
                            <div class="divide-border border-border flex flex-col divide-y border-y">
                                <button [class]="action" rdxDrawerClose>Save to Photos</button>
                                <button [class]="action" rdxDrawerClose>Copy Link</button>
                                <button [class]="action" rdxDrawerClose>Add to Album</button>
                            </div>

                            <!-- Destructive action, set apart by a full-bleed spacer. -->
                            <div class="bg-muted h-2" aria-hidden="true"></div>
                            <button
                                [class]="cn(action, 'border-border text-destructive border-b font-medium')"
                                rdxDrawerClose
                            >
                                Delete Photo
                            </button>

                            <div class="bg-muted h-2" aria-hidden="true"></div>
                            <button [class]="cn(action, 'font-semibold')" rdxDrawerClose>Cancel</button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerActionSheetComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly action = action;
}
