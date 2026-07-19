# Navigation Menu — Right to left

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `dir="rtl"` on the root. Placement, alignment, and arrow-key direction follow the reading
direction.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-rtl',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" dir="rtl" rdxNavigationMenuRoot>
            <ul [class]="m.list" dir="rtl" rdxNavigationMenuList>
                @for (group of groups; track group.value) {
                    <li [value]="group.value" rdxNavigationMenuItem>
                        <button [class]="m.trigger" rdxNavigationMenuTrigger>
                            {{ group.label }}
                            <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div [class]="cn(m.content, 'w-[300px]')">
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

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
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
```
