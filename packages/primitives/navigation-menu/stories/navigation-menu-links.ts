import { demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-links',
    imports: [...navigationMenuImports],
    template: `
        <nav rdxNavigationMenuRoot [class]="m.root">
            <ul rdxNavigationMenuList [class]="m.list">
                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink active href="#" [class]="m.link">Home</a>
                </li>
                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink href="#" [class]="m.link">Docs</a>
                </li>
                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink href="#" [class]="m.link">Pricing</a>
                </li>
                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink href="#" [class]="m.link">Blog</a>
                </li>
            </ul>
        </nav>
    `
})
export class RdxNavigationMenuLinksComponent {
    protected readonly m = demoNavigationMenu;
}
