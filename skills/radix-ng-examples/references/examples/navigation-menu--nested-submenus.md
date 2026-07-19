# Navigation Menu — Nested submenus

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Render a `rdxNavigationMenuRoot` inside content for a nested menu. The nested root detects its parent,
positions its own popup inline, and link selection closes both the nested and parent roots.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-nested',
    imports: [...navigationMenuImports, LucideChevronDown, LucideChevronRight],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="overview">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Overview
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:min-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'grid-cols-1 min-[640px]:grid-cols-[12rem_12rem]')">
                                @for (item of overviewLinks; track item.href) {
                                    <li>
                                        <a [class]="m.cardLink" [href]="item.href" rdxNavigationMenuLink>
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }

                                <li>
                                    <nav orientation="vertical" rdxNavigationMenuRoot>
                                        <ul [class]="m.contentGrid" rdxNavigationMenuList>
                                            <li rdxNavigationMenuItem value="handbook">
                                                <button
                                                    [class]="
                                                        cn(
                                                            m.cardLink,
                                                            'relative w-full border-0 bg-transparent text-left text-inherit'
                                                        )
                                                    "
                                                    rdxNavigationMenuTrigger
                                                >
                                                    <span [class]="m.cardHeading">Handbook</span>
                                                    <p [class]="m.cardText">How to use Base UI effectively.</p>
                                                    <svg
                                                        [class]="
                                                            cn(
                                                                m.icon,
                                                                'absolute top-1/2 right-2.5 -translate-y-1/2 data-[popup-open]:rotate-0'
                                                            )
                                                        "
                                                        rdxNavigationMenuIcon
                                                        lucideChevronRight
                                                    ></svg>
                                                </button>

                                                <ng-container *rdxNavigationMenuContent>
                                                    <div
                                                        [class]="
                                                            cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-[400px]')
                                                        "
                                                    >
                                                        <ul [class]="m.contentGrid">
                                                            @for (item of handbookLinks; track item.href) {
                                                                <li>
                                                                    <a
                                                                        [class]="m.cardLink"
                                                                        [href]="item.href"
                                                                        rdxNavigationMenuLink
                                                                    >
                                                                        <div [class]="m.cardHeading">
                                                                            {{ item.title }}
                                                                        </div>
                                                                        <p [class]="m.cardText">
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
                                            *rdxNavigationMenuPortal
                                            [class]="m.positioner"
                                            [align]="'end'"
                                            [alignOffset]="-8"
                                            side="right"
                                            sideOffset="8"
                                            rdxNavigationMenuPositioner
                                        >
                                            <div [class]="cn(m.popup, 'text-left')" rdxNavigationMenuPopup>
                                                <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                                            </div>
                                        </div>
                                    </nav>
                                </li>
                            </ul>
                        </div>
                    </ng-container>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="10" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <svg
                        [class]="m.arrow"
                        width="10"
                        height="5"
                        viewBox="0 0 30 10"
                        preserveAspectRatio="none"
                        rdxNavigationMenuArrow
                    >
                        <polygon points="0,0 30,0 15,10" />
                    </svg>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

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
