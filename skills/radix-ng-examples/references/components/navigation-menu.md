# Navigation Menu

#### A collection of links and menus for website navigation.

Navigation Menu is a navigation list of triggers and links whose content is rendered into one shared popup.
It composes the shared Popper, Portal, Presence, Dismissable Layer, and Composite primitives and
remains headless: styles and native CSS animations belong to the consumer.

```typescript
import { Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-default',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="overview">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Overview
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:max-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'grid-cols-1 min-[500px]:grid-cols-2')">
                                @for (item of overviewLinks; track item.title) {
                                    <li>
                                        <a [class]="m.cardLink" [href]="item.href" rdxNavigationMenuLink>
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem value="handbook">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Handbook
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:max-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'max-w-[400px]')">
                                @for (item of handbookLinks; track item.title) {
                                    <li>
                                        <a [class]="m.cardLink" [href]="item.href" rdxNavigationMenuLink>
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="https://github.com/mui/base-ui">GitHub</a>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <svg
                        [class]="m.arrow"
                        width="10"
                        height="5"
                        viewBox="0 0 30 10"
                        preserveAspectRatio="none"
                        rdxNavigationMenuArrow
                    >
                        <polygon points="0,0 30,0 15,10" />
                    </svg>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly overviewLinks = [
        {
            href: '/react/overview/quick-start',
            title: 'Quick Start',
            description: 'Install and assemble your first component.'
        },
        {
            href: '/react/overview/accessibility',
            title: 'Accessibility',
            description: 'Learn how we build accessible components.'
        },
        {
            href: '/react/overview/releases',
            title: 'Releases',
            description: "See what's new in the latest Base UI versions."
        },
        {
            href: '/react/overview/about',
            title: 'About',
            description: 'Learn more about Base UI and our mission.'
        }
    ];

    protected readonly handbookLinks = [
        {
            href: '/react/handbook/styling',
            title: 'Styling',
            description: 'Base UI components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
        },
        {
            href: '/react/handbook/animation',
            title: 'Animation',
            description:
                'Base UI components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
        },
        {
            href: '/react/handbook/composition',
            title: 'Composition',
            description: 'Base UI components can be replaced and composed with your own existing components.'
        }
    ];
}
```

## Features

- ✅ A single shared popup, anchored to the active trigger with the Floating UI-based Popper primitive.
- ✅ Content morphs between items, exposing `data-activation-direction` and a `data-previous` snapshot for slide animations.
- ✅ Opens on hover with configurable `delay` / `closeDelay`, and a polygon grace area that keeps the popup reachable.
- ✅ `value` / `defaultValue` model with `onValueChange`, `onOpenChange`, and `onOpenChangeComplete` outputs.
- ✅ Keyboard navigation between triggers and top-level links (arrow keys) via the shared Composite primitive.
- ✅ Enter / Space / entry arrow keys open a trigger and move focus into its content; arrows / Home / End navigate the open panel.
- ✅ Horizontal and vertical orientations and LTR / RTL layouts.
- ✅ Nested navigation menus; selecting a nested link also closes the parent menu.
- ✅ Closes on Escape and outside pointer interaction, restoring focus to the trigger.
- ✅ Keeps the popup mounted while CSS exit keyframes finish, with opt-in persistent mounting through `keepMounted` / `forceMount`.
- ✅ Exposes state, transition, placement, and size attributes and CSS variables for styling.

## Import

```typescript
import {
    RdxNavigationMenuArrow,
    RdxNavigationMenuBackdrop,
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
```

Or import all parts through the module:

```typescript
import { RdxNavigationMenuModule } from '@radix-ng/primitives/navigation-menu';
```

## Anatomy

Apply the parts to your own markup. Each item's `*rdxNavigationMenuContent` template is rendered into
the shared `rdxNavigationMenuViewport`. `rdxNavigationMenuPortal` is a **structural** directive: it
teleports the popup into `document.body` while the menu is open and keeps it mounted until the
closed-state exit keyframes finish. Add `[keepMounted]="true"` when the portal should stay in the DOM
even while closed. Use `*rdxNavigationMenuPortal` on the positioner for the common single-root case,
or the explicit `<ng-template rdxNavigationMenuPortal>` form shown below when an optional
`rdxNavigationMenuBackdrop` makes the content multi-root.

```html
<nav rdxNavigationMenuRoot>
    <ul rdxNavigationMenuList>
        <li rdxNavigationMenuItem value="products">
            <button rdxNavigationMenuTrigger>
                Products
                <svg rdxNavigationMenuIcon></svg>
            </button>

            <ng-container *rdxNavigationMenuContent>
                <a rdxNavigationMenuLink href="#">Analytics</a>
            </ng-container>
        </li>

        <li rdxNavigationMenuItem>
            <a rdxNavigationMenuLink href="#">Pricing</a>
        </li>
    </ul>

    <ng-template rdxNavigationMenuPortal>
        <div rdxNavigationMenuBackdrop></div>
        <div sideOffset="8" rdxNavigationMenuPositioner>
            <div rdxNavigationMenuPopup>
                <svg rdxNavigationMenuArrow></svg>
                <div rdxNavigationMenuViewport></div>
            </div>
        </div>
    </ng-template>
</nav>
```

## Examples

### Default

A horizontal navigation list with two content panels and a standalone link. Content slides and resizes as
the active item changes.

```typescript
import { Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-default',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="overview">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Overview
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:max-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'grid-cols-1 min-[500px]:grid-cols-2')">
                                @for (item of overviewLinks; track item.title) {
                                    <li>
                                        <a [class]="m.cardLink" [href]="item.href" rdxNavigationMenuLink>
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem value="handbook">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Handbook
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:max-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'max-w-[400px]')">
                                @for (item of handbookLinks; track item.title) {
                                    <li>
                                        <a [class]="m.cardLink" [href]="item.href" rdxNavigationMenuLink>
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </ng-container>
                </li>

                <li rdxNavigationMenuItem>
                    <a [class]="m.link" rdxNavigationMenuLink href="https://github.com/mui/base-ui">GitHub</a>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <svg
                        [class]="m.arrow"
                        width="10"
                        height="5"
                        viewBox="0 0 30 10"
                        preserveAspectRatio="none"
                        rdxNavigationMenuArrow
                    >
                        <polygon points="0,0 30,0 15,10" />
                    </svg>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly overviewLinks = [
        {
            href: '/react/overview/quick-start',
            title: 'Quick Start',
            description: 'Install and assemble your first component.'
        },
        {
            href: '/react/overview/accessibility',
            title: 'Accessibility',
            description: 'Learn how we build accessible components.'
        },
        {
            href: '/react/overview/releases',
            title: 'Releases',
            description: "See what's new in the latest Base UI versions."
        },
        {
            href: '/react/overview/about',
            title: 'About',
            description: 'Learn more about Base UI and our mission.'
        }
    ];

    protected readonly handbookLinks = [
        {
            href: '/react/handbook/styling',
            title: 'Styling',
            description: 'Base UI components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
        },
        {
            href: '/react/handbook/animation',
            title: 'Animation',
            description:
                'Base UI components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
        },
        {
            href: '/react/handbook/composition',
            title: 'Composition',
            description: 'Base UI components can be replaced and composed with your own existing components.'
        }
    ];
}
```

### Vertical

Set `orientation="vertical"` on the root and position the popup to the side with `side="right"`.

```typescript
import { Component } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-vertical',
    imports: [...navigationMenuImports, LucideChevronRight],
    template: `
        <nav [class]="m.root" orientation="vertical" rdxNavigationMenuRoot>
            <ul [class]="cn(m.list, 'w-48 flex-col items-stretch')" rdxNavigationMenuList>
                @for (group of groups; track group.value) {
                    <li [value]="group.value" rdxNavigationMenuItem>
                        <button [class]="cn(m.trigger, 'justify-between')" rdxNavigationMenuTrigger>
                            {{ group.label }}
                            <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronRight></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div [class]="cn(m.content, 'w-[260px]')">
                                <ul [class]="m.contentGrid">
                                    @for (link of group.links; track link) {
                                        <li>
                                            <a [class]="m.cardLink" rdxNavigationMenuLink href="#">
                                                <div [class]="m.cardHeading">{{ link }}</div>
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
                *rdxNavigationMenuPortal
                [class]="m.positioner"
                side="right"
                sideOffset="8"
                align="start"
                rdxNavigationMenuPositioner
            >
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuVerticalComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly groups = [
        { value: 'account', label: 'Account', links: ['Profile', 'Billing', 'Security'] },
        { value: 'workspace', label: 'Workspace', links: ['Members', 'Usage', 'Audit log'] },
        { value: 'support', label: 'Support', links: ['Help center', 'Contact us'] }
    ];
}
```

### Right to left

Set `dir="rtl"` on the root. Placement, alignment, and arrow-key direction follow the reading
direction.

```typescript
import { Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-rtl',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" dir="rtl" rdxNavigationMenuRoot>
            <ul [class]="m.list" dir="rtl" rdxNavigationMenuList>
                @for (group of groups; track group.value) {
                    <li [value]="group.value" rdxNavigationMenuItem>
                        <button [class]="m.trigger" rdxNavigationMenuTrigger>
                            {{ group.label }}
                            <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                        </button>

                        <ng-container *rdxNavigationMenuContent>
                            <div [class]="cn(m.content, 'w-[300px]')">
                                <ul [class]="m.contentGrid">
                                    @for (link of group.links; track link) {
                                        <li>
                                            <a [class]="m.cardLink" rdxNavigationMenuLink href="#">
                                                <div [class]="m.cardHeading">{{ link }}</div>
                                            </a>
                                        </li>
                                    }
                                </ul>
                            </div>
                        </ng-container>
                    </li>
                }
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="8" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuRtlComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly groups = [
        { value: 'about', label: 'حول', links: ['نبذة', 'الفريق', 'الوظائف'] },
        { value: 'products', label: 'المنتجات', links: ['التحليلات', 'التقارير', 'التكاملات'] }
    ];
}
```

### Links only

A navigation list of links without any popup. Links are plain tabbable anchors and expose `data-active`.

```typescript
import { Component } from '@angular/core';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { demoNavigationMenu } from '../../storybook/styles';

@Component({
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

### Custom links

`rdxNavigationMenuLink` composes onto your own anchor markup — rich rows with icons, external links,
and an "action" link that runs a handler via `(onSelect)` without closing the menu. Set
`[closeOnClick]="true"` on links that should close the menu after selection. The same directive sits
on a router link.

```typescript
import { Component, signal } from '@angular/core';
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

### Large menus

When the content exceeds the available space, constrain it with a `max-height` and let it scroll. The
viewport measures the capped height, so the popup stays a fixed size and the list scrolls inside it.

```typescript
import { Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

/**
 * Large menus: when the content exceeds the available space, constrain the content with a
 * `max-height` and let it scroll (`overflow-y-auto`). The viewport measures the capped height, so the
 * popup stays a fixed size and the list scrolls inside it.
 */
@Component({
    selector: 'rdx-navigation-menu-large',
    imports: [...navigationMenuImports, LucideChevronDown],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="components">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Components
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div class="w-[340px]">
                            <ul class="grid max-h-[320px] gap-1 overflow-y-auto p-2">
                                @for (item of components; track item.title) {
                                    <li>
                                        <a [class]="cn(m.cardLink, 'p-2.5')" rdxNavigationMenuLink href="#">
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.text }}</p>
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
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
export class RdxNavigationMenuLargeComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly components = [
        { title: 'Accordion', text: 'Vertically stacked, collapsible panels.' },
        { title: 'Alert Dialog', text: 'A modal dialog that interrupts the user.' },
        { title: 'Avatar', text: 'An image element with a text fallback.' },
        { title: 'Checkbox', text: 'A control that toggles between states.' },
        { title: 'Collapsible', text: 'Expand and collapse a content region.' },
        { title: 'Dialog', text: 'A window overlaid on the primary window.' },
        { title: 'Dropdown Menu', text: 'A menu of actions triggered by a button.' },
        { title: 'Popover', text: 'Rich content floating around a trigger.' },
        { title: 'Progress', text: 'Displays task completion progress.' },
        { title: 'Radio Group', text: 'A set of mutually exclusive options.' },
        { title: 'Select', text: 'A control for choosing from a list.' },
        { title: 'Slider', text: 'Pick a value from a given range.' },
        { title: 'Switch', text: 'A toggle between on and off.' },
        { title: 'Tabs', text: 'Layered sections of content.' },
        { title: 'Tooltip', text: 'A hint that appears on hover or focus.' }
    ];
}
```

### Nested submenus

Render a `rdxNavigationMenuRoot` inside content for a nested menu. The nested root detects its parent,
positions its own popup inline, and link selection closes both the nested and parent roots.

```typescript
import { Component } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { navigationMenuImports } from '@radix-ng/primitives/navigation-menu';
import { cn, demoNavigationMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-navigation-menu-nested',
    imports: [...navigationMenuImports, LucideChevronDown, LucideChevronRight],
    template: `
        <nav [class]="m.root" rdxNavigationMenuRoot>
            <ul [class]="m.list" rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="overview">
                    <button [class]="m.trigger" rdxNavigationMenuTrigger>
                        Overview
                        <svg [class]="m.icon" rdxNavigationMenuIcon lucideChevronDown></svg>
                    </button>

                    <ng-container *rdxNavigationMenuContent>
                        <div
                            [class]="cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-max min-[500px]:min-w-[400px]')"
                        >
                            <ul [class]="cn(m.contentGrid, 'grid-cols-1 min-[640px]:grid-cols-[12rem_12rem]')">
                                @for (item of overviewLinks; track item.href) {
                                    <li>
                                        <a [class]="m.cardLink" [href]="item.href" rdxNavigationMenuLink>
                                            <div [class]="m.cardHeading">{{ item.title }}</div>
                                            <p [class]="m.cardText">{{ item.description }}</p>
                                        </a>
                                    </li>
                                }

                                <li>
                                    <nav orientation="vertical" rdxNavigationMenuRoot>
                                        <ul [class]="m.contentGrid" rdxNavigationMenuList>
                                            <li rdxNavigationMenuItem value="handbook">
                                                <button
                                                    [class]="
                                                        cn(
                                                            m.cardLink,
                                                            'relative w-full border-0 bg-transparent text-left text-inherit'
                                                        )
                                                    "
                                                    rdxNavigationMenuTrigger
                                                >
                                                    <span [class]="m.cardHeading">Handbook</span>
                                                    <p [class]="m.cardText">How to use Base UI effectively.</p>
                                                    <svg
                                                        [class]="
                                                            cn(
                                                                m.icon,
                                                                'absolute top-1/2 right-2.5 -translate-y-1/2 data-[state=open]:rotate-0'
                                                            )
                                                        "
                                                        rdxNavigationMenuIcon
                                                        lucideChevronRight
                                                    ></svg>
                                                </button>

                                                <ng-container *rdxNavigationMenuContent>
                                                    <div
                                                        [class]="
                                                            cn(m.content, 'w-[calc(100vw-40px)] min-[500px]:w-[400px]')
                                                        "
                                                    >
                                                        <ul [class]="m.contentGrid">
                                                            @for (item of handbookLinks; track item.href) {
                                                                <li>
                                                                    <a
                                                                        [class]="m.cardLink"
                                                                        [href]="item.href"
                                                                        rdxNavigationMenuLink
                                                                    >
                                                                        <div [class]="m.cardHeading">
                                                                            {{ item.title }}
                                                                        </div>
                                                                        <p [class]="m.cardText">
                                                                            {{ item.description }}
                                                                        </p>
                                                                    </a>
                                                                </li>
                                                            }
                                                        </ul>
                                                    </div>
                                                </ng-container>
                                            </li>
                                        </ul>

                                        <div
                                            *rdxNavigationMenuPortal
                                            [class]="m.positioner"
                                            [align]="'end'"
                                            [alignOffset]="-8"
                                            side="right"
                                            sideOffset="8"
                                            rdxNavigationMenuPositioner
                                        >
                                            <div [class]="cn(m.popup, 'text-left')" rdxNavigationMenuPopup>
                                                <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                                            </div>
                                        </div>
                                    </nav>
                                </li>
                            </ul>
                        </div>
                    </ng-container>
                </li>
            </ul>

            <div *rdxNavigationMenuPortal [class]="m.positioner" sideOffset="10" rdxNavigationMenuPositioner>
                <div [class]="m.popup" rdxNavigationMenuPopup>
                    <svg
                        [class]="m.arrow"
                        width="10"
                        height="5"
                        viewBox="0 0 30 10"
                        preserveAspectRatio="none"
                        rdxNavigationMenuArrow
                    >
                        <polygon points="0,0 30,0 15,10" />
                    </svg>
                    <div [class]="m.viewport" rdxNavigationMenuViewport></div>
                </div>
            </div>
        </nav>
    `
})
export class RdxNavigationMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly m = demoNavigationMenu;

    protected readonly overviewLinks = [
        {
            href: '/react/overview/quick-start',
            title: 'Quick Start',
            description: 'Install and assemble your first component.'
        },
        {
            href: '/react/overview/accessibility',
            title: 'Accessibility',
            description: 'Learn how we build accessible components.'
        },
        {
            href: '/react/overview/releases',
            title: 'Releases',
            description: "See what's new in the latest Base UI versions."
        }
    ];

    protected readonly handbookLinks = [
        {
            href: '/react/handbook/styling',
            title: 'Styling',
            description: 'Base UI components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules.'
        },
        {
            href: '/react/handbook/animation',
            title: 'Animation',
            description:
                'Base UI components can be animated with CSS transitions, CSS animations, or JavaScript libraries.'
        },
        {
            href: '/react/handbook/composition',
            title: 'Composition',
            description: 'Base UI components can be replaced and composed with your own existing components.'
        }
    ];
}
```

### Nested inline submenus

A second level that stays in the same panel: inside the outer content, render another
`rdxNavigationMenuRoot` with only a `List` and a `Viewport` (no Portal). A controlled, non-null value
keeps the inline panel persistent.

```typescript
import { Component, signal } from '@angular/core';
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

## API Reference

### Root

`RdxNavigationMenuRoot` owns the open state. The menu is open whenever `value` is non-null.

### Trigger

`RdxNavigationMenuTrigger` opens its item's content and exposes state attributes. While open it points
`aria-controls` at the shared popup id, matching Base UI's navigation semantics.

### Content

`RdxNavigationMenuContent` is a structural directive; its template is rendered into the shared
viewport when its item is active. Add `[forceMount]="true"` on the explicit
`<ng-template rdxNavigationMenuContent>` form to keep inactive content mounted, hidden, and inert.

### Link

`RdxNavigationMenuLink` is a navigation link. It emits `(onSelect)` and keeps the menu open by
default; set `[closeOnClick]="true"` when selection should close the menu.

### Portal

`RdxNavigationMenuPortal` is a structural directive (`*rdxNavigationMenuPortal` or
`<ng-template rdxNavigationMenuPortal>`) that teleports the popup to `document.body` by default. Pass
`[container]` on the explicit `<ng-template>` form to portal into a different element, and
`[keepMounted]="true"` to keep the closed portal mounted.

### Positioner

`RdxNavigationMenuPositioner` delegates placement and collision handling to the shared Popper
primitive and exposes anchor / `--positioner-width` / `--positioner-height` CSS variables.

### Viewport

`RdxNavigationMenuViewport` renders the active item's content, animates the transition between items,
and consumes the inherited `--popup-width` / `--popup-height` variables for the size morph.

### List, Item, Icon, Popup, Arrow, and Backdrop

These parts read their behavior and state from context. `List` groups the navigation items with
composite focus, `Item` carries the `value`, `Icon` exposes the open state for a caret, and `Popup`,
`Arrow`, and `Backdrop` reflect open / placement / transition state for styling. `Popup` owns
`--popup-width` / `--popup-height`, and `Backdrop` is presentational.

## Accessibility

### Keyboard Interactions

| Key | Description |
| --- | --- |
| `ArrowLeft` / `ArrowRight` | Moves focus between triggers in a horizontal root. Respects `dir` — `ArrowLeft` moves to the previous item in LTR and to the next in RTL. |
| `ArrowUp` / `ArrowDown` | Moves focus between triggers in a vertical root. |
| `Enter` / `Space` | Toggles the focused trigger's content panel open or closed and moves focus into the open panel. |
| `ArrowDown` | When a horizontal trigger is focused, opens that trigger's content panel and moves focus to the first focusable element inside it. |
| `ArrowRight` | When a vertical (LTR) trigger is focused, opens that trigger's content panel and moves focus to the first focusable element inside it. |
| `ArrowLeft` | When a vertical (RTL) trigger is focused, opens that trigger's content panel and moves focus to the first focusable element inside it. |
| `Home` / `End` | Inside an open panel, moves focus to the first / last focusable element. |
| `Tab` | Moves focus to the next tabbable element. Inside an open panel, advances through the panel's links; on the last one, moves focus out of the menu. |
| `Shift` + `Tab` | Moves focus to the previous tabbable element, exiting the menu when pressed on the first trigger. |
| `Escape` | Closes the open popup and returns focus to the trigger that opened it. |
