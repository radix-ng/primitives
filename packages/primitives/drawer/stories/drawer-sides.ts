import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports, RdxDrawerSwipeDirection } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

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
                <div [swipeDirection]="item.swipeDirection" rdxDrawerRoot>
                    <button [class]="cn(b.base, b.outline, b.size.md, 'capitalize')" rdxDrawerTrigger>
                        {{ item.side }}
                    </button>

                    <ng-template rdxDrawerPortal>
                        <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                        <div [class]="cn(d.popup, d.side[item.side])" rdxDrawerPopup>
                            <div [class]="d.body" rdxDrawerContent>
                                <h2 [class]="cn(d.title, 'capitalize')" rdxDrawerTitle>{{ item.side }} drawer</h2>
                                <p [class]="d.description" rdxDrawerDescription>
                                    Swipe {{ item.swipeDirection }} to dismiss.
                                </p>

                                <div [class]="d.footer">
                                    <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Done</button>
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
