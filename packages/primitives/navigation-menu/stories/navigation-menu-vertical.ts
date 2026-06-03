import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-vertical',
    imports: [...navigationMenuImports, LucideChevronRight],
    template: `
        <nav orientation="vertical" rdxNavigationMenuRoot [class]="m.root">
            <ul rdxNavigationMenuList [class]="cn(m.list, 'w-48 flex-col items-stretch')">
                @for (group of groups; track group.value) {
                    <li rdxNavigationMenuItem [value]="group.value">
                        <button rdxNavigationMenuTrigger [class]="cn(m.trigger, 'justify-between')">
                            {{ group.label }}
                            <svg rdxNavigationMenuIcon lucideChevronRight [class]="m.icon"></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div [class]="cn(m.content, 'w-[260px]')">
                                <ul [class]="m.contentGrid">
                                    @for (link of group.links; track link) {
                                        <li>
                                            <a rdxNavigationMenuLink href="#" [class]="m.cardLink">
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
                side="right"
                sideOffset="8"
                align="start"
                rdxNavigationMenuPositioner
                [class]="m.positioner"
            >
                <div rdxNavigationMenuPopup [class]="m.popup">
                    <div rdxNavigationMenuViewport [class]="m.viewport"></div>
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
