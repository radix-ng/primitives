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
