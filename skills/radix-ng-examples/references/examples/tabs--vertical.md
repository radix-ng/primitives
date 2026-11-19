# Tabs — Vertical

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Set `orientation="vertical"` on the root to lay the tabs out vertically and switch arrow-key navigation
to `ArrowUp` / `ArrowDown`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab
} from '@radix-ng/primitives/tabs';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-tabs-vertical-example',
    imports: [RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab],
    template: `
        <div
            class="demo-tabs-root flex w-[420px] w-[520px] overflow-hidden"
            rdxTabsRoot
            defaultValue="account"
            orientation="vertical"
        >
            <div class="border-border bg-muted/30 flex w-40 shrink-0 flex-col border-r" rdxTabsList>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center justify-start px-4 focus-visible:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center justify-start px-4 focus-visible:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center justify-start px-4 focus-visible:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="team"
                >
                    Team
                </button>
            </div>
            <div class="demo-tabs-panel flex-1 p-6" rdxTabsPanel value="account">
                Make changes to your account here. Click save when you're done.
            </div>
            <div class="demo-tabs-panel flex-1 p-6" rdxTabsPanel value="password">
                Change your password here. After saving, you'll be logged out.
            </div>
            <div class="demo-tabs-panel flex-1 p-6" rdxTabsPanel value="team">
                Invite teammates and manage their roles.
            </div>
        </div>
    `
})
export class TabsVerticalStory {}
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
