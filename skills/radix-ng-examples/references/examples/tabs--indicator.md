# Tabs — Indicator

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

`RdxTabsIndicator` exposes the active tab's geometry as CSS variables, so a single element can animate to
follow the selected tab.

Its host has `role="presentation"` and stays mounted but hidden when no selected tab has a nonzero
size. It updates when the List or any tab resizes, including when a label changes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-indicator-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsIndicator],
    template: `
        <div class="demo-tabs-root w-[460px] overflow-hidden" rdxTabsRoot defaultValue="overview">
            <div class="demo-tabs-list relative flex" rdxTabsList>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 focus-visible:ring-2"
                    rdxTabsTab
                    value="overview"
                >
                    Overview
                </button>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 focus-visible:ring-2"
                    rdxTabsTab
                    value="activity"
                >
                    Activity
                </button>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 focus-visible:ring-2"
                    rdxTabsTab
                    value="settings"
                >
                    Settings
                </button>
                <span
                    class="bg-primary absolute bottom-0 left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] transition-all duration-300 ease-out"
                    rdxTabsIndicator
                ></span>
            </div>
            <div class="demo-tabs-panel p-6" rdxTabsPanel value="overview">
                A high-level summary of your workspace and recent highlights.
            </div>
            <div class="demo-tabs-panel p-6" rdxTabsPanel value="activity">
                Everything that happened recently, in reverse chronological order.
            </div>
            <div class="demo-tabs-panel p-6" rdxTabsPanel value="settings">
                Configure preferences, members, and integrations for this workspace.
            </div>
        </div>
    `
})
export class TabsIndicatorExample {}
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
