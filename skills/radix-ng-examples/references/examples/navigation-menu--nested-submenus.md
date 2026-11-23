# Navigation Menu — Nested submenus

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Render a `rdxNavigationMenuRoot` inside content for a nested menu. The nested root detects its parent,
positions its own popup next to its trigger, and links with `closeOnClick` close both roots. The nested
triggers participate in the parent panel's arrow navigation. Enter or Space opens a nested popup
without moving focus; Tab enters it, and Escape returns focus to its trigger.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
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
    selector: 'rdx-navigation-menu-nested',
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
        LucideChevronDown,
        LucideChevronRight
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
                        <div class="w-[calc(100vw-40px)] p-4 min-[500px]:w-max min-[500px]:min-w-[400px]">
                            <ul class="grid grid-cols-1 gap-2 min-[640px]:grid-cols-[12rem_12rem]">
                                @for (item of overviewLinks; track item.href) {
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

                                <li>
                                    <nav orientation="vertical" rdxNavigationMenuRoot>
                                        <ul class="grid gap-2" rdxNavigationMenuList>
                                            <li rdxNavigationMenuItem value="handbook">
                                                <button
                                                    class="demo-navigation-menu-card-link demo-focus relative block h-full w-full p-3 pe-8 text-start no-underline"
                                                    rdxNavigationMenuTrigger
                                                >
                                                    <span class="demo-label mb-1">Handbook</span>
                                                    <p class="demo-navigation-menu-card-text">
                                                        How to use Base UI effectively.
                                                    </p>
                                                    <svg
                                                        class="absolute end-2.5 top-1/2 size-3.5 shrink-0 -translate-y-1/2"
                                                        rdxNavigationMenuIcon
                                                        lucideChevronRight
                                                    ></svg>
                                                </button>

                                                <ng-container *rdxNavigationMenuContent>
                                                    <div class="w-[calc(100vw-40px)] p-4 min-[500px]:w-[400px]">
                                                        <ul class="grid gap-2">
                                                            @for (item of handbookLinks; track item.href) {
                                                                <li>
                                                                    <a
                                                                        class="demo-navigation-menu-card-link demo-focus block p-3 no-underline"
                                                                        [href]="item.href"
                                                                        rdxNavigationMenuLink
                                                                    >
                                                                        <div class="demo-label mb-1">
                                                                            {{ item.title }}
                                                                        </div>
                                                                        <p class="demo-navigation-menu-card-text">
                                                                            {{ item.description }}
                                                                        </p>
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
                                            [align]="'end'"
                                            [alignOffset]="-8"
                                            side="right"
                                            sideOffset="8"
                                            rdxNavigationMenuPositioner
                                        >
                                            <div
                                                class="demo-surface data-[open]:animate-navigation-menu-popup-in data-[starting-style]:animate-navigation-menu-popup-in data-[ending-style]:animate-navigation-menu-popup-out relative origin-[var(--transform-origin)] p-0 text-left"
                                                rdxNavigationMenuPopup
                                            >
                                                <div
                                                    class="[&>[data-current]]:animate-navigation-menu-content-in [&>[data-previous]]:animate-navigation-menu-content-out relative block h-[var(--popup-height,auto)] w-[var(--popup-width,max-content)] overflow-hidden transition-[width,height] duration-200 [&>[data-previous]]:absolute [&>[data-previous]]:inset-0"
                                                    rdxNavigationMenuViewport
                                                ></div>
                                            </div>
                                        </div>
                                    </nav>
                                </li>
                            </ul>
                        </div>
                    </ng-container>
                </li>
            </ul>

            <div
                class="z-50 data-[closed]:pointer-events-none"
                *rdxNavigationMenuPortal
                sideOffset="10"
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
export class RdxNavigationMenuNestedComponent {
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
