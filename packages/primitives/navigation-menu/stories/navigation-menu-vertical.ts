import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
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
    selector: 'rdx-navigation-menu-vertical',
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
        LucideChevronRight
    ],
    template: `
        <nav class="relative flex justify-center" orientation="vertical" rdxNavigationMenuRoot>
            <ul
                class="demo-surface flex w-56 list-none flex-col items-center items-stretch gap-1 p-1"
                rdxNavigationMenuList
            >
                @for (group of groups; track group.value) {
                    <li [value]="group.value" rdxNavigationMenuItem>
                        <button
                            class="demo-navigation-menu-trigger demo-label data-[popup-open]:bg-muted demo-focus flex h-9 w-full items-center justify-between gap-1 px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            rdxNavigationMenuTrigger
                        >
                            {{ group.label }}
                            <svg class="size-3.5 shrink-0" rdxNavigationMenuIcon lucideChevronRight></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div class="w-[260px] p-4">
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
                side="right"
                sideOffset="8"
                align="start"
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
export class RdxNavigationMenuVerticalComponent {
    protected readonly groups = [
        { value: 'account', label: 'Account', links: ['Profile', 'Billing', 'Security'] },
        { value: 'workspace', label: 'Workspace', links: ['Members', 'Usage', 'Audit log'] },
        { value: 'support', label: 'Support', links: ['Help center', 'Contact us'] }
    ];
}
