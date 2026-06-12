import { Component } from '@angular/core';
import { drawerImports, RdxDrawerSwipeDirection } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

const SIDES: RdxDrawerSwipeDirection[] = ['top', 'right', 'bottom', 'left'];

@Component({
    selector: 'rdx-drawer-sides',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-wrap gap-3">
            @for (side of sides; track side) {
                <div [swipeDirection]="side" rdxDrawerRoot>
                    <button [class]="cn(b.base, b.outline, b.size.md, 'capitalize')" rdxDrawerTrigger>
                        {{ side }}
                    </button>

                    <ng-template rdxDrawerPortal>
                        <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                        <div [class]="cn(d.popup, d.side[side])" rdxDrawerPopup>
                            <div [class]="d.body" rdxDrawerContent>
                                <h2 [class]="cn(d.title, 'capitalize')" rdxDrawerTitle>{{ side }} drawer</h2>
                                <p [class]="d.description" rdxDrawerDescription>
                                    Swipe toward the {{ side }} edge to dismiss.
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
