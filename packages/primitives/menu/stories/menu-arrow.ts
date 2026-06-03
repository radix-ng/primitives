import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-arrow',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">With Arrow</button>

            <div *rdxMenuPortal sideOffset="8" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="cn(m.popup, 'relative')">
                    <span rdxMenuArrow [class]="m.arrow"></span>
                    <button rdxMenuItem [class]="m.item">New Tab</button>
                    <button rdxMenuItem [class]="m.item">New Window</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Print…</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuArrowExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
