import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

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
        <nav rdxNavigationMenuRoot [class]="m.root">
            <ul rdxNavigationMenuList [class]="m.list">
                <li rdxNavigationMenuItem value="browse">
                    <button rdxNavigationMenuTrigger [class]="m.trigger">
                        Browse
                        <svg rdxNavigationMenuIcon lucideChevronDown [class]="m.icon"></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <!-- Inline second-level menu (flex row): categories left, viewport right. -->
                        <nav
                            class="flex w-[560px]"
                            orientation="vertical"
                            rdxNavigationMenuRoot
                            [value]="active()"
                            (onValueChange)="onActive($event)"
                        >
                            <ul
                                class="border-border flex w-44 shrink-0 flex-col gap-1 border-r p-2"
                                rdxNavigationMenuList
                            >
                                @for (cat of categories; track cat.value) {
                                    <li rdxNavigationMenuItem [value]="cat.value">
                                        <button
                                            rdxNavigationMenuTrigger
                                            [class]="cn(m.trigger, 'w-full justify-start')"
                                        >
                                            {{ cat.label }}
                                        </button>

                                        <ng-container *rdxNavigationMenuContent>
                                            <ul class="grid gap-1">
                                                @for (link of cat.links; track link.title) {
                                                    <li>
                                                        <a rdxNavigationMenuLink href="#" [class]="m.cardLink">
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

                            <div rdxNavigationMenuViewport [class]="inlineViewport"></div>
                        </nav>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink href="#" [class]="m.link">Pricing</a>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal sideOffset="8" rdxNavigationMenuPositioner [class]="m.positioner">
                <div rdxNavigationMenuPopup [class]="m.popup">
                    <div rdxNavigationMenuViewport [class]="m.viewport"></div>
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
