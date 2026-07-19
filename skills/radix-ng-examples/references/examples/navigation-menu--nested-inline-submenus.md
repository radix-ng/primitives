# Navigation Menu — Nested inline submenus

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A second level that stays in the same panel: inside the outer content, render another
`rdxNavigationMenuRoot` with only a `List` and a `Viewport` (no Portal). A controlled, non-null value
keeps the inline panel persistent.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

/**
 * Nested inline submenus: a second level that stays in the same panel. Inside the outer Content we
 * render another `rdxNavigationMenuRoot` with only a `List` (the categories, left) and a `Viewport`
 * (the active category's links, right) — no Portal/Positioner/Popup. Its value is controlled and
 * kept non-null so the inline panel always shows a category (the idea behind Base UI's `defaultValue`).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-nested-inline',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="browse">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Browse
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <!-- Inline second-level menu (flex row): categories left, viewport right. -->
                        <nav
                            class="flex w-[560px]"
                            [value]="active()"
                            (onValueChange)="onActive($event)"
                            orientation="vertical"
                            rdxNavigationMenuRoot
                        >
                            <ul
                                class="border-border flex w-44 shrink-0 flex-col gap-1 border-r p-2"
                                rdxNavigationMenuList
                            >
                                @for (cat of categories; track cat.value) {
                                    <li [value]="cat.value" rdxNavigationMenuItem>
                                        <button
                                            [class]="cn(m.trigger, 'w-full justify-start')"
                                            rdxNavigationMenuTrigger
                                        >
                                            {{ cat.label }}
                                        </button>

                                        <ng-container *rdxNavigationMenuContent>
                                            <ul class="grid gap-1">
                                                @for (link of cat.links; track link.title) {
                                                    <li>
                                                        <a [class]="m.cardLink" rdxNavigationMenuLink href="#">
                                                            <div [class]="m.cardHeading">{{ link.title }}</div>
                                                            <p [class]="m.cardText">{{ link.text }}</p>
                                                        </a>
                                                    </li>
                                                }
                                            </ul>
                                        </ng-container>
                                    </li>
                                }
                            </ul>

                            <div [class]="inlineViewport" rdxNavigationMenuViewport></div>
                        </nav>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="#">Pricing</a>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuNestedInlineComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;
    protected readonly active = signal('learn');

    protected readonly inlineViewport = cn(
        'relative min-h-[180px] flex-1 overflow-hidden p-2',
        '[&>[data-current]]:animate-navigation-menu-content-in',
        '[&>[data-previous]]:absolute [&>[data-previous]]:inset-0 [&>[data-previous]]:p-2 [&>[data-previous]]:animate-navigation-menu-content-out'
    );

    protected readonly categories = [
        {
            value: 'learn',
            label: 'Learn',
            links: [
                { title: 'Tutorials', text: 'Step-by-step introductions.' },
                { title: 'Guides', text: 'Patterns and best practices.' },
                { title: 'Examples', text: 'Copy-paste building blocks.' }
            ]
        },
        {
            value: 'develop',
            label: 'Develop',
            links: [
                { title: 'API reference', text: 'Every input and output.' },
                { title: 'CLI', text: 'Scaffold and generate.' }
            ]
        },
        {
            value: 'resources',
            label: 'Resources',
            links: [
                { title: 'Blog', text: 'Product news and deep dives.' },
                { title: 'Changelog', text: 'What shipped recently.' },
                { title: 'Community', text: 'Ask and share.' }
            ]
        }
    ];

    protected onActive(value: string | null) {
        // Keep the inline panel persistent: ignore the "closed" (null) state.
        if (value) {
            this.active.set(value);
        }
    }
}
```
