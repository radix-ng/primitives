# Navigation Menu — Links only

> One example from the [Navigation Menu](../components/navigation-menu.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A navigation list of links without any popup. Links are plain tabbable anchors and expose `data-active`.

```typescript
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
```
