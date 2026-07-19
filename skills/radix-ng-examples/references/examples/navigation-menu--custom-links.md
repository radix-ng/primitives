# Navigation Menu — Custom links

> One example from the [Navigation Menu](../components/navigation-menu.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`rdxNavigationMenuLink` composes onto your own anchor markup — rich rows with icons, external links,
and an "action" link that runs a handler via `(onSelect)` without closing the menu. Set
`[closeOnClick]="true"` on links that should close the menu after selection. The same directive sits
on a router link.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideArrowUpRight, LucideBookOpen, LucideChevronDown, LucideCode, LucideLifeBuoy } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

/**
 * Custom links: `rdxNavigationMenuLink` composes onto your own anchor markup — rich rows with icons,
 * an external link (opens in a new tab), and an "action" link that runs a handler via `(onSelect)`
 * without closing the menu. Add `[closeOnClick]="true"` when a link selection should close the menu.
 * The same directive would sit on a router link.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-navigation-menu-custom-links',
    imports: [
        ...navigationMenuImports,
        LucideChevronDown,
        LucideArrowUpRight,
        LucideBookOpen,
        LucideCode,
        LucideLifeBuoy
    ],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="resources">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Resources
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <ul class="grid w-[420px] gap-1 p-2">
                            <li>
                                <a [class]="row" rdxNavigationMenuLink href="#">
                                    <span [class]="iconBox"><svg lucideBookOpen size="18"></svg></span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span [class]="m.cardHeading">Documentation</span>
                                        <span [class]="m.cardText">Guides and API references.</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a [class]="row" rdxNavigationMenuLink href="#">
                                    <span [class]="iconBox"><svg lucideLifeBuoy size="18"></svg></span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span [class]="m.cardHeading">Support</span>
                                        <span [class]="m.cardText">Get help from the community.</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <!-- An external link — the directive sits on a normal anchor. -->
                                <a
                                    [class]="row"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                    rdxNavigationMenuLink
                                    href="https://github.com/radix-ng/primitives"
                                >
                                    <span [class]="iconBox"><svg lucideCode size="18"></svg></span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span [class]="cn(m.cardHeading, 'flex items-center gap-1')">
                                            GitHub
                                            <svg class="text-muted-foreground size-3" lucideArrowUpRight></svg>
                                        </span>
                                        <span [class]="m.cardText">Star and contribute on GitHub.</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <!-- Action link: keeps the menu open and runs a handler instead of navigating. -->
                                <a [class]="row" (onSelect)="copy($event)" rdxNavigationMenuLink href="#">
                                    <span [class]="iconBox"><svg lucideCode size="18"></svg></span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span [class]="m.cardHeading">
                                            {{ copied() ? 'Copied!' : 'Copy install command' }}
                                        </span>
                                        <span [class]="cn(m.cardText, 'font-mono')">
                                            npm i &#64;radix-ng/primitives
                                        </span>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </ng-container>
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
export class RdxNavigationMenuCustomLinksComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;
    protected readonly copied = signal(false);

    protected readonly row = cn(
        'flex items-start gap-3 rounded-md p-3 no-underline outline-none transition-colors',
        'hover:bg-muted focus-visible:bg-muted'
    );
    protected readonly iconBox = 'flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground';

    protected copy(event: Event) {
        event.preventDefault();
        this.copied.set(true);
    }
}
```
