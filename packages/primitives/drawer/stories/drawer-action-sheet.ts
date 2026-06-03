import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';

/** A full-width action-sheet row. */
const action = cn(
    'block w-full px-4 py-3 text-center text-sm text-foreground',
    'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
);

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-action-sheet',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button rdxDrawerTrigger [class]="cn(b.base, b.primary, b.size.md)">Photo options</button>

            <ng-template rdxDrawerPortal>
                <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                <div rdxDrawerPopup [class]="cn(d.popup, d.side.bottom)">
                    <div aria-hidden="true" [class]="d.grip"></div>

                    <div class="overflow-y-auto pb-2" rdxDrawerContent>
                        <h2 class="sr-only" rdxDrawerTitle>Photo options</h2>
                        <p class="text-muted-foreground px-6 py-3 text-center text-xs" rdxDrawerDescription>
                            Choose an action for this photo
                        </p>

                        <!-- Primary group of actions. -->
                        <div class="divide-border border-border flex flex-col divide-y border-y">
                            <button rdxDrawerClose [class]="action">Save to Photos</button>
                            <button rdxDrawerClose [class]="action">Copy Link</button>
                            <button rdxDrawerClose [class]="action">Add to Album</button>
                        </div>

                        <!-- Destructive action, set apart by a full-bleed spacer. -->
                        <div class="bg-muted h-2" aria-hidden="true"></div>
                        <button
                            rdxDrawerClose
                            [class]="cn(action, 'border-border text-destructive border-b font-medium')"
                        >
                            Delete Photo
                        </button>

                        <div class="bg-muted h-2" aria-hidden="true"></div>
                        <button rdxDrawerClose [class]="cn(action, 'font-semibold')">Cancel</button>
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
