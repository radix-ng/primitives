import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import {
    RdxNavigationMenuContent,
    RdxNavigationMenuIcon,
    RdxNavigationMenuItem,
    RdxNavigationMenuLink,
    RdxNavigationMenuList,
    RdxNavigationMenuPopup,
    RdxNavigationMenuPortal,
    RdxNavigationMenuPositioner,
    RdxNavigationMenuRoot,
    RdxNavigationMenuTrigger,
    RdxNavigationMenuViewport
} from '@radix-ng/primitives/navigation-menu';

/**
 * Large menus: when the content exceeds the available space, constrain the content with a
 * `max-height` and let it scroll (`overflow-y-auto`). The viewport measures the capped height, so the
 * popup stays a fixed size and the list scrolls inside it.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-large',
    imports: [
        RdxNavigationMenuRoot,
        RdxNavigationMenuList,
        RdxNavigationMenuItem,
        RdxNavigationMenuTrigger,
        RdxNavigationMenuIcon,
        RdxNavigationMenuContent,
        RdxNavigationMenuLink,
        RdxNavigationMenuPortal,
        RdxNavigationMenuPositioner,
        RdxNavigationMenuPopup,
        RdxNavigationMenuViewport,
        LucideChevronDown
    ],
    template: `
        <nav class="relative flex justify-center" rdxNavigationMenuRoot>
            <ul class="demo-surface flex list-none items-center gap-1 p-1" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="components">
                    <button
                        class="demo-navigation-menu-trigger demo-label data-[popup-open]:bg-muted demo-focus flex h-9 items-center gap-1 px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        rdxNavigationMenuTrigger
                    >
                        Components
                        <svg
                            class="size-3.5 shrink-0 transition-transform duration-200 data-[popup-open]:rotate-180"
                            rdxNavigationMenuIcon
                            lucideChevronDown
                        ></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[340px] max-w-[calc(100vw-2rem)] p-4">
                            <ul class="grid max-h-80 gap-1 overflow-y-auto overscroll-contain p-1">
                                @for (item of components; track item.title) {
                                    <li>
                                        <a
                                            class="demo-navigation-menu-card-link demo-focus block p-3 no-underline"
                                            rdxNavigationMenuLink
                                            href="#"
                                        >
                                            <div class="demo-label mb-1">{{ item.title }}</div>
                                            <p class="demo-navigation-menu-card-text">{{ item.text }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>
            </ul>

            <div
                class="z-50 data-[closed]:pointer-events-none"
                *rdxNavigationMenuPortal
                sideOffset="8"
                rdxNavigationMenuPositioner
            >
                <div
                    class="demo-popup data-[open]:animate-navigation-menu-popup-in data-[starting-style]:animate-navigation-menu-popup-in data-[ending-style]:animate-navigation-menu-popup-out relative origin-[var(--transform-origin)] p-0"
                    rdxNavigationMenuPopup
                >
                    <div
                        class="[&>[data-current]]:animate-navigation-menu-content-in [&>[data-previous]]:animate-navigation-menu-content-out relative block h-[var(--popup-height,auto)] w-[var(--popup-width,max-content)] overflow-hidden transition-[width,height] duration-200 [&>[data-previous]]:absolute [&>[data-previous]]:inset-0"
                        rdxNavigationMenuViewport
                    ></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuLargeComponent {
    protected readonly components = [
        { title: 'Accordion', text: 'Vertically stacked, collapsible panels.' },
        { title: 'Alert Dialog', text: 'A modal dialog that interrupts the user.' },
        { title: 'Avatar', text: 'An image element with a text fallback.' },
        { title: 'Checkbox', text: 'A control that toggles between states.' },
        { title: 'Collapsible', text: 'Expand and collapse a content region.' },
        { title: 'Dialog', text: 'A window overlaid on the primary window.' },
        { title: 'Dropdown Menu', text: 'A menu of actions triggered by a button.' },
        { title: 'Popover', text: 'Rich content floating around a trigger.' },
        { title: 'Progress', text: 'Displays task completion progress.' },
        { title: 'Radio Group', text: 'A set of mutually exclusive options.' },
        { title: 'Select', text: 'A control for choosing from a list.' },
        { title: 'Slider', text: 'Pick a value from a given range.' },
        { title: 'Switch', text: 'A toggle between on and off.' },
        { title: 'Tabs', text: 'Layered sections of content.' },
        { title: 'Tooltip', text: 'A hint that appears on hover or focus.' }
    ];
}
