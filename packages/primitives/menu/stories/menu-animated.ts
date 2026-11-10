import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-animated',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Animated</button>
            <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                <div [class]="cn(m.popup, m.popupAnimated)" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>New Tab</button>
                    <button [class]="m.item" rdxMenuItem>New Window</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>
                    <button [class]="m.item" rdxMenuItem>Print…</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuAnimatedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
