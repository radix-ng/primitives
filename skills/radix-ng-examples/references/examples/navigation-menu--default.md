# Navigation Menu — Default

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

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
            <ul class="text-foreground relative flex list-none items-center gap-px" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="overview">
                    <button
                        class="demo-button demo-button-ghost data-popup-open:bg-muted h-8 gap-1 px-3"
                        rdxNavigationMenuTrigger
                    >
                        Overview
                        <svg
                            class="size-3.5 shrink-0 data-popup-open:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
                            rdxNavigationMenuIcon
                            lucideChevronDown
                        ></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[calc(100vw-3rem)] max-w-100 p-1">
                            <ul class="grid grid-cols-1 gap-2 min-[500px]:grid-cols-2">
                                @for (item of overviewLinks; track item.title) {
                                    <li>
                                        <a
                                            class="text-foreground hover:bg-muted focus-visible:outline-ring block p-3 no-underline focus-visible:outline-2 focus-visible:-outline-offset-1"
                                            [href]="item.href"
                                            rdxNavigationMenuLink
                                        >
                                            <div class="mb-1 text-sm leading-4">{{ item.title }}</div>
                                            <p class="text-muted-foreground text-sm">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem value="handbook">
                    <button
                        class="demo-button demo-button-ghost data-popup-open:bg-muted h-8 gap-1 px-3"
                        rdxNavigationMenuTrigger
                    >
                        Handbook
                        <svg
                            class="size-3.5 shrink-0 data-popup-open:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
                            rdxNavigationMenuIcon
                            lucideChevronDown
                        ></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[calc(100vw-3rem)] max-w-100 p-1">
                            <ul class="grid max-w-[400px] gap-2">
                                @for (item of handbookLinks; track item.title) {
                                    <li>
                                        <a
                                            class="text-foreground hover:bg-muted focus-visible:outline-ring block p-3 no-underline focus-visible:outline-2 focus-visible:-outline-offset-1"
                                            [href]="item.href"
                                            rdxNavigationMenuLink
                                        >
                                            <div class="mb-1 text-sm leading-4">{{ item.title }}</div>
                                            <p class="text-muted-foreground text-sm">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a
                        class="demo-button demo-button-ghost h-8 px-3 no-underline"
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
                    class="demo-popup relative origin-(--transform-origin) data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 motion-safe:transition-[scale,opacity] motion-safe:duration-150"
                    rdxNavigationMenuPopup
                >
                    <span class="h-1.5 w-3" rdxNavigationMenuArrow aria-hidden="true">
                        <span class="demo-popup-arrow block size-full"></span>
                    </span>
                    <div
                        class="[&>[data-current]]:animate-navigation-menu-content-in [&>[data-previous]]:animate-navigation-menu-content-out relative block h-[var(--popup-height,auto)] w-[var(--popup-width,max-content)] overflow-hidden motion-safe:transition-[width,height] motion-safe:duration-200 [&>[data-previous]]:absolute [&>[data-previous]]:inset-0"
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
