import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-default',
    imports: [...navigationMenuImports, LucideChevronDown],
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
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:max-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'grid-cols-1 min-[500px]:grid-cols-2')">
                                @for (item of overviewLinks; track item.title) {
                                    <li>
                                        <a rdxNavigationMenuLink [class]="m.cardLink" [href]="item.href">
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem value="handbook">
                    <button rdxNavigationMenuTrigger [class]="m.trigger">
                        Handbook
                        <svg rdxNavigationMenuIcon lucideChevronDown [class]="m.icon"></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:max-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'max-w-[400px]')">
                                @for (item of handbookLinks; track item.title) {
                                    <li>
                                        <a rdxNavigationMenuLink [class]="m.cardLink" [href]="item.href">
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink href="https://github.com/mui/base-ui" [class]="m.link">GitHub</a>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal sideOffset="8" rdxNavigationMenuPositioner [class]="m.positioner">
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
export class RdxNavigationMenuDefaultComponent {
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
