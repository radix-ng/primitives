# Tabs — Default

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Copy the standalone component and follow the linked example setup.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-tabs-default-example',
    imports: [RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab],
    template: `
        <div class="w-80 max-w-full" rdxTabsRoot defaultValue="account">
            <div class="relative isolate z-1 -mb-px flex gap-1" rdxTabsList>
                <button
                    class="text-foreground hover:not-data-active:bg-muted focus-visible:outline-ring relative inline-flex h-8 items-center px-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-1 aria-disabled:opacity-50"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-foreground hover:not-data-active:bg-muted focus-visible:outline-ring relative inline-flex h-8 items-center px-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-1 aria-disabled:opacity-50"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
                <span
                    class="border-foreground bg-background absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) translate-x-(--active-tab-left) border-x border-t motion-safe:transition-[translate,width] motion-safe:duration-150"
                    rdxTabsIndicator
                ></span>
            </div>
            <div class="border-foreground text-foreground min-h-32 border p-3 text-sm" rdxTabsPanel value="account">
                Make changes to your account here. Click save when you're done.
            </div>
            <div class="border-foreground text-foreground min-h-32 border p-3 text-sm" rdxTabsPanel value="password">
                Change your password here. After saving, you'll be logged out.
            </div>
        </div>
    `
})
export class TabsDefaultStory {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
