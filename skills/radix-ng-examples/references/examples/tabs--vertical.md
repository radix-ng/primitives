# Tabs — Vertical

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
