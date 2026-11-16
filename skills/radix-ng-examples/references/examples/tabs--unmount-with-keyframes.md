# Tabs — Unmount with `@keyframes`

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

With `*rdxTabsPanelPresence`, the shared presence machine watches the panel and its descendants for
exit animations or transitions before destroying the whole view. Mark the panel as a `group` so the
inner element can react to the parent's `data-ending-style` and run the exit keyframes. The panel
stays visible and inert until removal. Its ID belongs to the structural instance and stays stable
when the native Panel is recreated.

**Migration:** move the former inner `*rdxTabsPanelPresence` onto the Panel host, move its `value`
into the structural expression and move structural `keepMounted` into the microsyntax above.
The former argument-free inner presence syntax is no longer supported.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-keyframes-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    // The complete panel view is mounted only while its tab is active.
    // On enter the inner element plays `tabs-panel-in`; when the tab is left, the parent panel gets
    // `data-ending-style`, so the inner element runs the exit keyframes while the panel remains
    // visible and inert. The presence machine waits for the panel and its descendants to finish.
    template: `
        <div
            class="border-border bg-background text-foreground w-[420px] overflow-hidden rounded-xl border shadow-sm"
            rdxTabsRoot
            defaultValue="account"
        >
            <div class="border-border bg-muted/30 flex border-b" rdxTabsList>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
            </div>
            <div class="grid">
                <div class="group col-start-1 row-start-1" *rdxTabsPanelPresence="'account'" rdxTabsPanel>
                    <div
                        class="bg-background text-foreground animate-tabs-panel-in group-data-[ending-style]:animate-tabs-panel-out p-6 text-sm leading-6 outline-none"
                    >
                        Make changes to your account here. Click save when you're done.
                    </div>
                </div>
                <div class="group col-start-1 row-start-1" *rdxTabsPanelPresence="'password'" rdxTabsPanel>
                    <div
                        class="bg-background text-foreground animate-tabs-panel-in group-data-[ending-style]:animate-tabs-panel-out p-6 text-sm leading-6 outline-none"
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
