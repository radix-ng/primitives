import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-nested',
    imports: [...navigationMenuImports, LucideChevronDown, LucideChevronRight],
    template: `
        <nav rdxNavigationMenuRoot [class]="m.root">
            <ul rdxNavigationMenuList [class]="m.list">
                <li rdxNavigationMenuItem value="overview">
                    <button rdxNavigationMenuTrigger [class]="m.trigger">
                        Overview
                        <svg rdxNavigationMenuIcon lucideChevronDown [class]="m.icon"></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:min-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'grid-cols-1 min-[640px]:grid-cols-[12rem_12rem]')">
                                @for (item of overviewLinks; track item.href) {
                                    <li>
                                        <a rdxNavigationMenuLink [class]="m.cardLink" [href]="item.href">
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }

                                <li>
                                    <nav orientation="vertical" rdxNavigationMenuRoot>
                                        <ul rdxNavigationMenuList [class]="m.contentGrid">
                                            <li rdxNavigationMenuItem value="handbook">
                                                <button
                                                    rdxNavigationMenuTrigger
                                                    [class]="
                                                        cn(
                                                            m.cardLink,
                                                            'relative w-full border-0 bg-transparent text-left text-inherit'
                                                        )
                                                    "
                                                >
                                                    <span [class]="m.cardHeading">Handbook</span>
                                                    <p [class]="m.cardText">How to use Base UI effectively.</p>
                                                    <svg
                                                        rdxNavigationMenuIcon
                                                        lucideChevronRight
                                                        [class]="
                                                            cn(
                                                                m.icon,
                                                                'absolute top-1/2 right-2.5 -translate-y-1/2 data-[popup-open]:rotate-0'
                                                            )
                                                        "
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
                                                                        rdxNavigationMenuLink
                                                                        [class]="m.cardLink"
                                                                        [href]="item.href"
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
                                            side="right"
                                            sideOffset="8"
                                            rdxNavigationMenuPositioner
                                            [class]="m.positioner"
                                            [align]="'end'"
                                            [alignOffset]="-8"
                                        >
                                            <div rdxNavigationMenuPopup [class]="cn(m.popup, 'text-left')">
                                                <div rdxNavigationMenuViewport [class]="m.viewport"></div>
                                            </div>
                                        </div>
                                    </nav>
                                </li>
                            </ul>
                        </div>
                    </ng-container>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal sideOffset="10" rdxNavigationMenuPositioner [class]="m.positioner">
                <div rdxNavigationMenuPopup [class]="m.popup">
                    <svg
                        width="10"
                        height="5"
                        viewBox="0 0 30 10"
                        preserveAspectRatio="none"
                        rdxNavigationMenuArrow
                        [class]="m.arrow"
                    >
                        <polygon points="0,0 30,0 15,10" />
                    </svg>
                    <div rdxNavigationMenuViewport [class]="m.viewport"></div>
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
