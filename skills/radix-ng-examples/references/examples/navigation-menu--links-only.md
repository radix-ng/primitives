# Navigation Menu — Links only

> One example from the [Navigation Menu](../components/navigation-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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
