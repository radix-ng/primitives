import { cn, demoNavigationMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideArrowUpRight, LucideBookOpen, LucideChevronDown, LucideCode, LucideLifeBuoy } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';

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
        <nav rdxNavigationMenuRoot [class]="m.root">
            <ul rdxNavigationMenuList [class]="m.list">
                <li rdxNavigationMenuItem value="resources">
                    <button rdxNavigationMenuTrigger [class]="m.trigger">
                        Resources
                        <svg rdxNavigationMenuIcon lucideChevronDown [class]="m.icon"></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <ul class="grid w-[420px] gap-1 p-2">
                            <li>
                                <a rdxNavigationMenuLink href="#" [class]="row">
                                    <span [class]="iconBox"><svg lucideBookOpen size="18"></svg></span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span [class]="m.cardHeading">Documentation</span>
                                        <span [class]="m.cardText">Guides and API references.</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a rdxNavigationMenuLink href="#" [class]="row">
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
                                    rel="noreferrer noopener"
                                    target="_blank"
                                    rdxNavigationMenuLink
                                    href="https://github.com/radix-ng/primitives"
                                    [class]="row"
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
                                <a rdxNavigationMenuLink href="#" [class]="row" (onSelect)="copy($event)">
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

            <div *rdxNavigationMenuPortal sideOffset="8" rdxNavigationMenuPositioner [class]="m.positioner">
                <div rdxNavigationMenuPopup [class]="m.popup">
                    <div rdxNavigationMenuViewport [class]="m.viewport"></div>
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
