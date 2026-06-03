import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-rtl',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav dir="rtl" rdxNavigationMenuRoot [class]="m.root">
            <ul dir="rtl" rdxNavigationMenuList [class]="m.list">
                @for (group of groups; track group.value) {
                    <li rdxNavigationMenuItem [value]="group.value">
                        <button rdxNavigationMenuTrigger [class]="m.trigger">
                            {{ group.label }}
                            <svg rdxNavigationMenuIcon lucideChevronDown [class]="m.icon"></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div [class]="cn(m.content, 'w-[300px]')">
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

            <div *rdxNavigationMenuPortal sideOffset="8" rdxNavigationMenuPositioner [class]="m.positioner">
                <div rdxNavigationMenuPopup [class]="m.popup">
                    <div rdxNavigationMenuViewport [class]="m.viewport"></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuRtlComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly groups = [
        { value: 'about', label: 'حول', links: ['نبذة', 'الفريق', 'الوظائف'] },
        { value: 'products', label: 'المنتجات', links: ['التحليلات', 'التقارير', 'التكاملات'] }
    ];
}
