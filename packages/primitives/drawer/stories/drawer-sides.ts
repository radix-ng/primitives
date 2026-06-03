import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports, RdxDrawerSwipeDirection } from '@radix-ng/primitives/drawer';

type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

const SIDES: { side: DrawerSide; swipeDirection: RdxDrawerSwipeDirection }[] = [
    { side: 'top', swipeDirection: 'up' },
    { side: 'right', swipeDirection: 'right' },
    { side: 'bottom', swipeDirection: 'down' },
    { side: 'left', swipeDirection: 'left' }
];

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-sides',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-wrap gap-3">
            @for (item of sides; track item.side) {
                <div rdxDrawerRoot [swipeDirection]="item.swipeDirection">
                    <button rdxDrawerTrigger [class]="cn(b.base, b.outline, b.size.md, 'capitalize')">
                        {{ item.side }}
                    </button>

                    <ng-template rdxDrawerPortal>
                        <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                        <div rdxDrawerPopup [class]="cn(d.popup, d.side[item.side])">
                            <div rdxDrawerContent [class]="d.body">
                                <h2 rdxDrawerTitle [class]="cn(d.title, 'capitalize')">{{ item.side }} drawer</h2>
                                <p rdxDrawerDescription [class]="d.description">
                                    Swipe {{ item.swipeDirection }} to dismiss.
                                </p>

                                <div [class]="d.footer">
                                    <button rdxDrawerClose [class]="cn(b.base, b.primary, b.size.sm)">Done</button>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </div>
            }
        </div>
    `
})
export class RdxDrawerSidesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly sides = SIDES;
}
