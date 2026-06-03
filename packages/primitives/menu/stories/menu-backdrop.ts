import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-backdrop',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot [modal]="true">
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">With Backdrop</button>

            <ng-template rdxMenuPortal>
                <div class="bg-foreground/10 fixed inset-0" rdxMenuBackdrop></div>
                <div sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">New Tab</button>
                        <button rdxMenuItem [class]="m.item">New Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">New Private Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Print…</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxMenuBackdropExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
