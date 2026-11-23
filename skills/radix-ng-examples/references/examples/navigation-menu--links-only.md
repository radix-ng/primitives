# Navigation Menu — Links only

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A navigation list of links without any popup. Links are plain tabbable anchors and expose `data-active`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxNavigationMenuItem,
    RdxNavigationMenuLink,
    RdxNavigationMenuList,
    RdxNavigationMenuRoot
} from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-links',
    imports: [RdxNavigationMenuRoot, RdxNavigationMenuList, RdxNavigationMenuItem, RdxNavigationMenuLink],
    template: `
        <nav class="relative flex justify-center" rdxNavigationMenuRoot>
            <ul class="demo-surface flex list-none items-center gap-1 p-1" rdxNavigationMenuList>
                <li rdxNavigationMenuItem>
                    <a
                        class="demo-navigation-menu-trigger demo-label demo-focus flex h-9 items-center px-3 no-underline"
                        rdxNavigationMenuLink
                        active
                        href="#"
                    >
                        Home
                    </a>
                </li>
                <li rdxNavigationMenuItem>
                    <a
                        class="demo-navigation-menu-trigger demo-label demo-focus flex h-9 items-center px-3 no-underline"
                        rdxNavigationMenuLink
                        href="#"
                    >
                        Docs
                    </a>
                </li>
                <li rdxNavigationMenuItem>
                    <a
                        class="demo-navigation-menu-trigger demo-label demo-focus flex h-9 items-center px-3 no-underline"
                        rdxNavigationMenuLink
                        href="#"
                    >
                        Pricing
                    </a>
                </li>
                <li rdxNavigationMenuItem>
                    <a
                        class="demo-navigation-menu-trigger demo-label demo-focus flex h-9 items-center px-3 no-underline"
                        rdxNavigationMenuLink
                        href="#"
                    >
                        Blog
                    </a>
                </li>
            </ul>
        </nav>
    `
})
export class RdxNavigationMenuLinksComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
