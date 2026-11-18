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
