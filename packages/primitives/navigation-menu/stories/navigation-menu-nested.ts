import { Component } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-nested',
    imports: [...navigationMenuImports, LucideChevronDown, LucideChevronRight],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="company">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Company
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div [class]="cn(m.content, 'w-[240px]')">
                            <!-- A nested navigation menu inside the content -->
                            <nav orientation="vertical" rdxNavigationMenuRoot>
                                <ul [class]="'flex list-none flex-col gap-1'" rdxNavigationMenuList>
                                    @for (group of groups; track group.value) {
                                        <li [value]="group.value" rdxNavigationMenuItem>
                                            <button
                                                [class]="cn(m.trigger, 'w-full justify-between')"
                                                rdxNavigationMenuTrigger
                                            >
                                                {{ group.label }}
                                                <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronRight></svg>
                                            </button>

                                            <ng-container *rdxNavigationMenuContent>
                                                <div [class]="cn(m.content, 'w-[200px]')">
                                                    <ul [class]="m.contentGrid">
                                                        @for (link of group.links; track link) {
                                                            <li>
                                                                <a [class]="m.cardLink" rdxNavigationMenuLink href="#">
                                                                    <div [class]="m.cardHeading">{{ link }}</div>
                                                                </a>
                                                            </li>
                                                        }
                                                    </ul>
                                                </div>
                                            </ng-container>
                                        </li>
                                    }
                                </ul>

                                <div
                                    *rdxNavigationMenuPortal
                                    [class]="m.positioner"
                                    side="right"
                                    sideOffset="12"
                                    align="start"
                                    rdxNavigationMenuPositioner
                                >
                                    <div [class]="m.popup" rdxNavigationMenuPopup>
                                        <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="#">Contact</a>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly groups = [
        { value: 'about', label: 'About', links: ['Mission', 'Team', 'Careers'] },
        { value: 'press', label: 'Press', links: ['News', 'Media kit'] }
    ];
}
