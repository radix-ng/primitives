# Menu — Viewport (animated resize)

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Wrap the popup content in `rdxMenuViewport` to smoothly animate the popup size when the content
changes — for example revealing an advanced section, or switching between menubar menus of different
sizes. The viewport measures content and exposes `--popup-width` / `--popup-height`; bind them on
the popup with a CSS transition (here via Tailwind arbitrary utilities, so no story-local CSS):

```html
<div
    [class]="cn(m.popup, 'overflow-hidden [width:var(--popup-width)] [height:var(--popup-height)] transition-[width,height] duration-200')"
    rdxMenuPopup
>
    <div rdxMenuViewport>…items…</div>
</div>
```

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

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
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Settings</button>

            <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                <div
                    [class]="
                        cn(
                            m.popup,
                            '[height:var(--popup-height)] [width:var(--popup-width)] overflow-hidden transition-[width,height] duration-200 ease-out'
                        )
                    "
                    rdxMenuPopup
                >
                    <div rdxMenuViewport>
                        <button [class]="m.item" [closeOnClick]="false" (onSelect)="toggle()" rdxMenuItem>
                            {{ expanded() ? 'Hide advanced' : 'Show advanced' }}
                        </button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Profile</button>
                        <button [class]="m.item" rdxMenuItem>Billing</button>

                        @if (expanded()) {
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <button [class]="m.item" rdxMenuItem>Keyboard shortcuts</button>
                            <button [class]="m.item" rdxMenuItem>Developer tools</button>
                            <button [class]="m.item" rdxMenuItem>Feature flags</button>
                            <button [class]="m.item" rdxMenuItem>API tokens</button>
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
```
