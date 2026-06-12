import { Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-default',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="products">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Products
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div [class]="cn(m.content, 'w-[480px]')">
                            <ul [class]="m.contentGrid">
                                @for (item of products; track item.title) {
                                    <li>
                                        <a [class]="m.cardLink" rdxNavigationMenuLink href="#">
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem value="resources">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Resources
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div [class]="cn(m.content, 'w-[320px]')">
                            <ul [class]="m.contentGrid">
                                @for (item of resources; track item.title) {
                                    <li>
                                        <a [class]="m.cardLink" rdxNavigationMenuLink href="#">
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
                    <a [class]="m.link" rdxNavigationMenuLink href="#">Pricing</a>
                </li>
            </ul>

            <div
                *rdxNavigationMenuPortal
                [class]="cn(m.positioner, m.positionerAnimated)"
                sideOffset="8"
                rdxNavigationMenuPositioner
            >
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
export class RdxNavigationMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly products = [
        { title: 'Analytics', description: 'Understand your traffic with privacy-first analytics.' },
        { title: 'Automations', description: 'Build workflows that run on your schedule.' },
        { title: 'Reports', description: 'Share insights with beautiful, exportable reports.' },
        { title: 'Integrations', description: 'Connect the tools your team already uses.' }
    ];

    protected readonly resources = [
        { title: 'Documentation', description: 'Guides and references to get you started.' },
        { title: 'Changelog', description: 'See what shipped in every release.' },
        { title: 'Community', description: 'Ask questions and share what you build.' }
    ];
}
