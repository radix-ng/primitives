# Tabs — Animated panels

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Panels stay mounted by default in Angular, so you can cross-fade them with the `data-starting-style`,
`data-ending-style` and `data-hidden` attributes — the panel keeps itself visible until the transition
finishes. Inactive panels are immediately inert, including during an exit, so their contents cannot
receive focus or pointer input. `data-hidden` is applied after the exit settles; use
`data-ending-style` to start exit motion.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-animated-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    // Panels stay mounted and cross-fade using the transition-status data attributes:
    // `data-starting-style` (enter), `data-ending-style` (exit) and `data-hidden` drive the opacity,
    // while the panel keeps itself visible until the transition finishes.
    template: `
        <div class="demo-tabs-root w-[420px] overflow-hidden" rdxTabsRoot defaultValue="account">
            <div class="demo-tabs-list flex" rdxTabsList>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
            </div>
            <div class="grid">
                <div
                    class="demo-tabs-panel col-start-1 row-start-1 p-6 opacity-100 transition-opacity duration-300 ease-out data-[ending-style]:opacity-0 data-[hidden]:opacity-0 data-[starting-style]:opacity-0"
                    rdxTabsPanel
                    value="account"
                >
                    Make changes to your account here. Click save when you're done.
                </div>
                <div
                    class="demo-tabs-panel col-start-1 row-start-1 p-6 opacity-100 transition-opacity duration-300 ease-out data-[ending-style]:opacity-0 data-[hidden]:opacity-0 data-[starting-style]:opacity-0"
                    rdxTabsPanel
                    value="password"
                >
                    Change your password here. After saving, you'll be logged out.
                </div>
            </div>
        </div>
    `
})
export class TabsAnimatedExample {}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
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
