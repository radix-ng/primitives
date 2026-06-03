import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

/**
 * Demonstrates `rdxMenuViewport`: the popup smoothly resizes as its content
 * changes size. The viewport measures the content and exposes `--popup-width` /
 * `--popup-height`; the popup binds them with a CSS transition (expressed here
 * with Tailwind arbitrary utilities, so no story-local CSS is needed).
 */
@Component({
    selector: 'rdx-menu-viewport',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Settings</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div
                    rdxMenuPopup
                    [class]="
                        cn(
                            m.popup,
                            '[height:var(--popup-height)] [width:var(--popup-width)] overflow-hidden transition-[width,height] duration-200 ease-out'
                        )
                    "
                >
                    <div rdxMenuViewport>
                        <button rdxMenuItem [class]="m.item" [closeOnClick]="false" (onSelect)="toggle()">
                            {{ expanded() ? 'Hide advanced' : 'Show advanced' }}
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Profile</button>
                        <button rdxMenuItem [class]="m.item">Billing</button>

                        @if (expanded()) {
                            <div rdxMenuSeparator [class]="m.separator"></div>
                            <button rdxMenuItem [class]="m.item">Keyboard shortcuts</button>
                            <button rdxMenuItem [class]="m.item">Developer tools</button>
                            <button rdxMenuItem [class]="m.item">Feature flags</button>
                            <button rdxMenuItem [class]="m.item">API tokens</button>
                        }
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuViewportExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

    readonly expanded = signal(false);

    toggle(): void {
        this.expanded.update((v) => !v);
    }
}
