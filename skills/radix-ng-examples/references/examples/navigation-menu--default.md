# Navigation Menu — Default

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A horizontal navigation list with two content panels and a standalone link. Content slides and resizes as
the active item changes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import {
    RdxNavigationMenuArrow,
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-default',
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
        RdxNavigationMenuArrow,
        RdxNavigationMenuViewport,
        LucideChevronDown
    ],
    template: `
        <nav class="relative flex justify-center" rdxNavigationMenuRoot>
            <ul class="demo-surface flex list-none items-center gap-1 p-1" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="overview">
                    <button
                        class="demo-navigation-menu-trigger demo-label data-[popup-open]:bg-muted demo-focus flex h-9 items-center gap-1 px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        rdxNavigationMenuTrigger
                    >
                        Overview
                        <svg
                            class="size-3.5 shrink-0 transition-transform duration-200 data-[popup-open]:rotate-180"
                            rdxNavigationMenuIcon
                            lucideChevronDown
                        ></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[calc(100vw-40px)] p-4 min-[500px]:w-max min-[500px]:max-w-[400px]">
                            <ul class="grid grid-cols-1 gap-2 min-[500px]:grid-cols-2">
                                @for (item of overviewLinks; track item.title) {
                                    <li>
                                        <a
                                            class="demo-navigation-menu-card-link demo-focus block p-3 no-underline"
                                            [href]="item.href"
                                            rdxNavigationMenuLink
                                        >
                                            <div class="demo-label mb-1">{{ item.title }}</div>
                                            <p class="demo-navigation-menu-card-text">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem value="handbook">
                    <button
                        class="demo-navigation-menu-trigger demo-label data-[popup-open]:bg-muted demo-focus flex h-9 items-center gap-1 px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        rdxNavigationMenuTrigger
                    >
                        Handbook
                        <svg
                            class="size-3.5 shrink-0 transition-transform duration-200 data-[popup-open]:rotate-180"
                            rdxNavigationMenuIcon
                            lucideChevronDown
                        ></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[calc(100vw-40px)] p-4 min-[500px]:w-max min-[500px]:max-w-[400px]">
                            <ul class="grid max-w-[400px] gap-2">
                                @for (item of handbookLinks; track item.title) {
                                    <li>
                                        <a
                                            class="demo-navigation-menu-card-link demo-focus block p-3 no-underline"
                                            [href]="item.href"
                                            rdxNavigationMenuLink
                                        >
                                            <div class="demo-label mb-1">{{ item.title }}</div>
                                            <p class="demo-navigation-menu-card-text">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a
                        class="demo-navigation-menu-trigger demo-label demo-focus flex h-9 items-center px-3 no-underline"
                        rdxNavigationMenuLink
                        href="https://github.com/mui/base-ui"
                    >
                        GitHub
                    </a>
                </li>
            </ul>

            <div
                class="z-50 data-[closed]:pointer-events-none"
                *rdxNavigationMenuPortal
                sideOffset="8"
                rdxNavigationMenuPositioner
            >
                <div
                    class="demo-surface data-[open]:animate-navigation-menu-popup-in data-[starting-style]:animate-navigation-menu-popup-in data-[ending-style]:animate-navigation-menu-popup-out relative origin-[var(--transform-origin)] p-0"
                    rdxNavigationMenuPopup
                >
                    <svg
                        class="text-card demo-arrow my-px"
                        width="10"
                        height="5"
                        viewBox="0 0 30 10"
                        preserveAspectRatio="none"
                        rdxNavigationMenuArrow
                    >
                        <polygon points="0,0 30,0 15,10" />
                    </svg>
                    <div
                        class="[&>[data-current]]:animate-navigation-menu-content-in [&>[data-previous]]:animate-navigation-menu-content-out relative block h-[var(--popup-height,auto)] w-[var(--popup-width,max-content)] overflow-hidden transition-[width,height] duration-200 [&>[data-previous]]:absolute [&>[data-previous]]:inset-0"
                        rdxNavigationMenuViewport
                    ></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuDefaultComponent {
    protected readonly overviewLinks = [
        {
            href: '/react/overview/quick-start',
            title: 'Quick Start',
            description: 'Install and assemble your first component.'
        },
        {
            href: '/react/overview/accessibility',
            title: 'Accessibility',
            description: 'Learn how we build accessible components.'
        },
        {
            href: '/react/overview/releases',
            title: 'Releases',
            description: "See what's new in the latest Base UI versions."
        },
        {
            href: '/react/overview/about',
            title: 'About',
            description: 'Learn more about Base UI and our mission.'
        }
    ];

    protected readonly handbookLinks = [
        {
            href: '/react/handbook/styling',
            title: 'Styling',
            description: 'Base UI components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
        },
        {
            href: '/react/handbook/animation',
            title: 'Animation',
            description:
                'Base UI components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
        },
        {
            href: '/react/handbook/composition',
            title: 'Composition',
            description: 'Base UI components can be replaced and composed with your own existing components.'
        }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
