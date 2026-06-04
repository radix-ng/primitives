import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-animated',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        `
            @keyframes popup-in {
                from {
                    opacity: 0;
                    transform: scale(0.95) translateY(-4px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            @keyframes popup-out {
                from {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95) translateY(-4px);
                }
            }
            .animated-popup {
                animation: popup-in 150ms ease;
            }
            .animated-popup[data-ending-style] {
                animation: popup-out 150ms ease;
            }
        `
    ],
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Animated</button>

            @if (root.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="cn(m.popup, 'animated-popup')" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>New Tab</button>
                        <button [class]="m.item" rdxMenuItem>New Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Print…</button>
                    </div>
                </div>
            }
        </ng-container>
    `
})
export class RdxMenuAnimatedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
