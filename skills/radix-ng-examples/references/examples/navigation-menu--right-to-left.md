# Navigation Menu — Right to left

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Set `dir="rtl"` on the root. Placement, alignment, and arrow-key direction follow the reading
direction.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import {
    RdxNavigationMenuContent,
    RdxNavigationMenuIcon,
    RdxNavigationMenuItem,
    RdxNavigationMenuLink,
    RdxNavigationMenuList,
    RdxNavigationMenuPopup,
    RdxNavigationMenuPortal,
    RdxNavigationMenuPositioner,
    RdxNavigationMenuRoot,
    RdxNavigationMenuTrigger,
    RdxNavigationMenuViewport
} from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-rtl',
    imports: [
        RdxNavigationMenuRoot,
        RdxNavigationMenuList,
        RdxNavigationMenuItem,
        RdxNavigationMenuTrigger,
        RdxNavigationMenuIcon,
        RdxNavigationMenuContent,
        RdxNavigationMenuLink,
        RdxNavigationMenuPortal,
        RdxNavigationMenuPositioner,
        RdxNavigationMenuPopup,
        RdxNavigationMenuViewport,
        LucideChevronDown
    ],
    template: `
        <nav class="relative flex justify-center" dir="rtl" rdxNavigationMenuRoot>
            <ul class="demo-surface flex list-none items-center gap-1 p-1" dir="rtl" rdxNavigationMenuList>
                @for (group of groups; track group.value) {
                    <li [value]="group.value" rdxNavigationMenuItem>
                        <button
                            class="demo-navigation-menu-trigger demo-label data-[popup-open]:bg-muted demo-focus flex h-9 items-center gap-1 px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            rdxNavigationMenuTrigger
                        >
                            {{ group.label }}
                            <svg
                                class="size-3.5 shrink-0 transition-transform duration-200 data-[popup-open]:rotate-180"
                                rdxNavigationMenuIcon
                                lucideChevronDown
                            ></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div class="w-[300px] p-4">
                                <ul class="grid gap-2">
                                    @for (link of group.links; track link) {
                                        <li>
                                            <a
                                                class="demo-navigation-menu-card-link demo-focus block p-3 no-underline"
                                                rdxNavigationMenuLink
                                                href="#"
                                            >
                                                <div class="demo-label mb-1">{{ link }}</div>
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
                class="z-50 data-[closed]:pointer-events-none"
                *rdxNavigationMenuPortal
                sideOffset="8"
                rdxNavigationMenuPositioner
            >
                <div
                    class="demo-popup data-[open]:animate-navigation-menu-popup-in data-[starting-style]:animate-navigation-menu-popup-in data-[ending-style]:animate-navigation-menu-popup-out relative origin-[var(--transform-origin)] p-0"
                    rdxNavigationMenuPopup
                >
                    <div
                        class="[&>[data-current]]:animate-navigation-menu-content-in [&>[data-previous]]:animate-navigation-menu-content-out relative block h-[var(--popup-height,auto)] w-[var(--popup-width,max-content)] overflow-hidden transition-[width,height] duration-200 [&>[data-previous]]:absolute [&>[data-previous]]:inset-0"
                        rdxNavigationMenuViewport
                    ></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuRtlComponent {
    protected readonly groups = [
        { value: 'about', label: 'حول', links: ['نبذة', 'الفريق', 'الوظائف'] },
        { value: 'products', label: 'المنتجات', links: ['التحليلات', 'التقارير', 'التكاملات'] }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
