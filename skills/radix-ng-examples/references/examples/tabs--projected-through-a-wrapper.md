# Tabs — Projected through a wrapper

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Tabs can be projected into a list owned by a wrapper component's view. The wrapper composes
`RdxTabsRoot` onto its host and keeps `RdxTabsList` in its template; projected tabs still participate
in roving focus and implicit selection.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'tabs-projected-wrapper',
    hostDirectives: [RdxTabsRoot],
    imports: [RdxTabsList],
    template: `
        <div class="demo-tabs-list flex" rdxTabsList>
            <ng-content select="[rdxTabsTab]" />
        </div>
        <ng-content />
    `
})
class TabsProjectedWrapper {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-projected-wrapper-example',
    imports: [TabsProjectedWrapper, RdxTabsTab, RdxTabsPanel],
    template: `
        <div class="flex flex-col gap-3">
            <p class="text-muted-foreground text-sm">Focus a tab, then use Arrow, Home, and End keys.</p>
            <tabs-projected-wrapper class="demo-tabs-root block w-[420px] overflow-hidden">
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="team"
                >
                    Team
                </button>

                <div
                    class="bg-background text-foreground p-6 text-sm leading-6 outline-none"
                    rdxTabsPanel
                    value="account"
                >
                    Make changes to your account here. The first projected tab was selected implicitly.
                </div>
                <div
                    class="bg-background text-foreground p-6 text-sm leading-6 outline-none"
                    rdxTabsPanel
                    value="password"
                >
                    Change your password here. After saving, you'll be logged out.
                </div>
                <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="team">
                    Invite teammates and manage their roles.
                </div>
            </tabs-projected-wrapper>
        </div>
    `
})
export class TabsProjectedWrapperExample {}
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
