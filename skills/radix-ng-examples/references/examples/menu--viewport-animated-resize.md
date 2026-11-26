# Menu — Viewport (animated resize)

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Wrap the popup content in `rdxMenuViewport` to smoothly animate the popup size when the content
changes — for example revealing an advanced section, or switching between menubar menus of different
sizes. The viewport measures content and exposes `--popup-width` / `--popup-height`; bind them on
the popup with a CSS transition (here via Tailwind arbitrary utilities, so no story-local CSS):

```html
<div
    class="demo-menu-popup [height:var(--popup-height)] [width:var(--popup-width)] min-w-[8rem] overflow-hidden p-1 transition-[width,height] duration-200 ease-out data-[closed]:pointer-events-none data-[closed]:hidden"
    rdxMenuPopup
>
    <div rdxMenuViewport>
        <div class="w-56">…items…</div>
    </div>
</div>
```

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger,
    RdxMenuViewport
} from '@radix-ng/primitives/menu';

/**
 * Demonstrates `rdxMenuViewport`: the popup smoothly resizes as its content
 * changes size. The viewport measures the content and exposes `--popup-width` /
 * `--popup-height`; the popup binds them with a CSS transition (expressed here
 * with Tailwind arbitrary utilities, so no story-local CSS is needed).
 */
@Component({
    selector: 'rdx-menu-viewport',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuViewport,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Settings</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup [height:var(--popup-height)] [width:var(--popup-width)] min-w-[8rem] overflow-hidden p-1 transition-[width,height] duration-200 ease-out data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <div rdxMenuViewport>
                        <div class="w-56">
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                [closeOnClick]="false"
                                (onSelect)="toggle()"
                                rdxMenuItem
                            >
                                {{ expanded() ? 'Hide advanced' : 'Show advanced' }}
                            </button>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Profile
                            </button>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                rdxMenuItem
                            >
                                Billing
                            </button>

                            @if (expanded()) {
                                <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Keyboard shortcuts
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Developer tools
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    Feature flags
                                </button>
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    rdxMenuItem
                                >
                                    API tokens
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuViewportExampleComponent {
    readonly expanded = signal(false);

    toggle(): void {
        this.expanded.update((v) => !v);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
