import { Component } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-vertical',
    imports: [...navigationMenuImports, LucideChevronRight],
    template: `
        <nav [class]="m.root" orientation="vertical" rdxNavigationMenuRoot>
            <ul [class]="cn(m.list, 'w-48 flex-col items-stretch')" rdxNavigationMenuList>
                @for (group of groups; track group.value) {
                    <li [value]="group.value" rdxNavigationMenuItem>
                        <button [class]="cn(m.trigger, 'justify-between')" rdxNavigationMenuTrigger>
                            {{ group.label }}
                            <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronRight></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div [class]="cn(m.content, 'w-[260px]')">
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
                [class]="cn(m.positioner, m.positionerAnimated)"
                side="right"
                sideOffset="8"
                align="start"
                rdxNavigationMenuPositioner
            >
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuVerticalComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly groups = [
        { value: 'account', label: 'Account', links: ['Profile', 'Billing', 'Security'] },
        { value: 'workspace', label: 'Workspace', links: ['Members', 'Usage', 'Audit log'] },
        { value: 'support', label: 'Support', links: ['Help center', 'Contact us'] }
    ];
}
