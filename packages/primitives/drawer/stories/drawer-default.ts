import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { drawerImports } from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-default',
    imports: [...drawerImports, LucideX],
    template: `
        <div rdxDrawerRoot>
            <button rdxDrawerTrigger [class]="cn(b.base, b.primary, b.size.md)">Open drawer</button>

            <ng-template rdxDrawerPortal>
                <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                <div rdxDrawerPopup [class]="cn(d.popup, d.side.bottom)">
                    <div aria-hidden="true" [class]="d.grip"></div>

                    <div rdxDrawerContent [class]="d.body">
                        <h2 rdxDrawerTitle [class]="d.title">Drag me down</h2>
                        <p rdxDrawerDescription [class]="d.description">
                            Swipe the sheet downwards or press Escape to dismiss it. Releasing before the halfway point
                            snaps it back.
                        </p>

                        <p class="text-muted-foreground mt-4 text-sm">
                            The grab handle above is purely visual — the whole panel is draggable. Scrollable regions
                            yield to scrolling until they reach their edge.
                        </p>

                        <div [class]="d.footer">
                            <button rdxDrawerClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                            <button rdxDrawerClose [class]="cn(b.base, b.primary, b.size.sm)">Confirm</button>
                        </div>
                    </div>

                    <button aria-label="Close" rdxDrawerClose [class]="d.close">
                        <svg aria-hidden="true" lucideX size="16"></svg>
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
