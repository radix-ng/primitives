# Navigation Menu — Custom links

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

`rdxNavigationMenuLink` composes onto your own anchor markup — rich rows with icons, external links,
and an "action" link that runs a handler via `(onSelect)` without closing the menu. Set
`[closeOnClick]="true"` on links that should close the menu after selection. The same directive sits
on a router link.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideArrowUpRight, LucideBookOpen, LucideChevronDown, LucideCode, LucideLifeBuoy } from '@lucide/angular';
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
        LucideChevronDown,
        LucideArrowUpRight,
        LucideBookOpen,
        LucideCode,
        LucideLifeBuoy
    ],
    template: `
        <nav class="relative flex justify-center" rdxNavigationMenuRoot>
            <ul class="demo-surface flex list-none items-center gap-1 p-1" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="resources">
                    <button
                        class="demo-navigation-menu-trigger demo-label data-[popup-open]:bg-muted demo-focus flex h-9 items-center gap-1 px-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        rdxNavigationMenuTrigger
                    >
                        Resources
                        <svg
                            class="size-3.5 shrink-0 transition-transform duration-200 data-[popup-open]:rotate-180"
                            rdxNavigationMenuIcon
                            lucideChevronDown
                        ></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <ul class="grid w-[420px] gap-1 p-2">
                            <li>
                                <a
                                    class="hover:bg-muted focus-visible:bg-muted flex items-start gap-3 rounded-md p-3 no-underline transition-colors outline-none"
                                    rdxNavigationMenuLink
                                    href="#"
                                >
                                    <span
                                        class="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                                    >
                                        <svg lucideBookOpen size="18"></svg>
                                    </span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span class="demo-label mb-1">Documentation</span>
                                        <span class="demo-navigation-menu-card-text">Guides and API references.</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a
                                    class="hover:bg-muted focus-visible:bg-muted flex items-start gap-3 rounded-md p-3 no-underline transition-colors outline-none"
                                    rdxNavigationMenuLink
                                    href="#"
                                >
                                    <span
                                        class="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                                    >
                                        <svg lucideLifeBuoy size="18"></svg>
                                    </span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span class="demo-label mb-1">Support</span>
                                        <span class="demo-navigation-menu-card-text">Get help from the community.</span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <!-- An external link — the directive sits on a normal anchor. -->
                                <a
                                    class="hover:bg-muted focus-visible:bg-muted flex items-start gap-3 rounded-md p-3 no-underline transition-colors outline-none"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                    rdxNavigationMenuLink
                                    href="https://github.com/radix-ng/primitives"
                                >
                                    <span
                                        class="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                                    >
                                        <svg lucideCode size="18"></svg>
                                    </span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span class="demo-label mb-1 flex items-center gap-1">
                                            GitHub
                                            <svg class="text-muted-foreground size-3" lucideArrowUpRight></svg>
                                        </span>
                                        <span class="demo-navigation-menu-card-text">
                                            Star and contribute on GitHub.
                                        </span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <!-- Action link: keeps the menu open and runs a handler instead of navigating. -->
                                <a
                                    class="hover:bg-muted focus-visible:bg-muted flex items-start gap-3 rounded-md p-3 no-underline transition-colors outline-none"
                                    (onSelect)="copy($event)"
                                    rdxNavigationMenuLink
                                    href="#"
                                >
                                    <span
                                        class="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                                    >
                                        <svg lucideCode size="18"></svg>
                                    </span>
                                    <span class="flex min-w-0 flex-1 flex-col">
                                        <span class="demo-label mb-1">
                                            {{ copied() ? 'Copied!' : 'Copy install command' }}
                                        </span>
                                        <span class="demo-navigation-menu-card-text font-mono">
                                            npm i &#64;radix-ng/primitives
                                        </span>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </ng-container>
                </li>
            </ul>

            <div
                class="z-50 data-[closed]:pointer-events-none"
                *rdxNavigationMenuPortal
                sideOffset="8"
                rdxNavigationMenuPositioner
            >
                <div
                    class="demo-surface data-[open]:animate-navigation-menu-popup-in data-[starting-style]:animate-navigation-menu-popup-in data-[ending-style]:animate-navigation-menu-popup-out relative origin-[var(--transform-origin)] p-0"
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
export class RdxNavigationMenuCustomLinksComponent {
    protected readonly copied = signal(false);

    protected copy(event: Event) {
        event.preventDefault();
        this.copied.set(true);
    }
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
