import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

/**
 * `keepMounted` keeps the popup in the DOM (portaled) while the menu is closed, so a consumer can query
 * or animate it without it unmounting. The positioner carries a native `hidden` while closed-and-settled
 * (removed from layout / a11y / tab order), Base UI-aligned.
 */
@Component({
    selector: 'rdx-menu-keep-mounted',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>File</button>

            <ng-template [keepMounted]="true" rdxMenuPortal>
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>New Tab</button>
                        <button [class]="m.item" rdxMenuItem>New Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Print…</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxMenuKeepMountedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
