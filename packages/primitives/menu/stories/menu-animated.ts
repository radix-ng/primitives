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
            /*
             * Unlike popover/navigation-menu, the shared menu popup carries 'data-[closed]:hidden' (it
             * is reused by the always-rendered menubar popups), so on close it is 'display: none' and
             * cannot run its own exit animation. The exit therefore lives on the positioner — keyed on
             * its 'data-open'/'data-closed' — which is what the presence machine waits on before
             * unmounting. This is a legitimate carrier, not an ADR-0011 "decoy".
             */
            @keyframes positioner-fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            @keyframes positioner-fade-out {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            .animated-positioner[data-open] {
                animation: positioner-fade-in 150ms ease;
            }
            .animated-positioner[data-closed] {
                animation: positioner-fade-out 150ms ease;
            }
        `
    ],
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Animated</button>

            <div *rdxMenuPortal [class]="cn(m.positioner, 'animated-positioner')" sideOffset="4" rdxMenuPositioner>
                <div [class]="cn(m.popup, 'animated-popup')" rdxMenuPopup>
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
