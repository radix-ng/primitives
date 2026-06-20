import { ChangeDetectionStrategy, Component } from '@angular/core';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { demoNavigationMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-links',
    imports: [...navigationMenuImports],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink active href="#">Home</a>
                </li>
                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="#">Docs</a>
                </li>
                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="#">Pricing</a>
                </li>
                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="#">Blog</a>
                </li>
            </ul>
        </nav>
    `
})
export class RdxNavigationMenuLinksComponent {
    protected readonly m = demoNavigationMenu;
}
