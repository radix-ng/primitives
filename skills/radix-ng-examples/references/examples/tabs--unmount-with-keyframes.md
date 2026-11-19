# Tabs — Unmount with `@keyframes`

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

With `*rdxTabsPanelPresence`, the shared render lifetime observes the Panel and explicit
`rdxPresenceTarget` descendants before destroying the whole view. Import `RdxPresenceTarget` for an
animated inner element. Mark the panel as a `group` so the
inner element can react to the parent's `data-ending-style` and run the exit keyframes. The panel
stays visible and inert until removal. Its ID belongs to the structural instance and stays stable
when the native Panel is recreated.

**Migration:** move the former inner `*rdxTabsPanelPresence` onto the Panel host, move its `value`
into the structural expression and move structural `keepMounted` into the microsyntax above.
The former argument-free inner presence syntax is no longer supported.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-keyframes-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence, RdxPresenceTarget],
    // The complete panel view is mounted only while its tab is active.
    // On enter the inner element plays `tabs-panel-in`; when the tab is left, the parent panel gets
    // `data-ending-style`, so the inner element runs the exit keyframes while the panel remains
    // visible and inert. Explicit targets share the Panel's render lifetime.
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
                <div class="group col-start-1 row-start-1" *rdxTabsPanelPresence="'account'" rdxTabsPanel>
                    <div
                        class="demo-tabs-panel animate-tabs-panel-in group-data-[ending-style]:animate-tabs-panel-out p-6"
                        rdxPresenceTarget
                    >
                        Make changes to your account here. Click save when you're done.
                    </div>
                </div>
                <div class="group col-start-1 row-start-1" *rdxTabsPanelPresence="'password'" rdxTabsPanel>
                    <div
                        class="demo-tabs-panel animate-tabs-panel-in group-data-[ending-style]:animate-tabs-panel-out p-6"
                        rdxPresenceTarget
                    >
                        Change your password here. After saving, you'll be logged out.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TabsKeyframesExample {}
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
