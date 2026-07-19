# Tabs — Animated panels

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Panels stay mounted by default in Angular, so you can cross-fade them with the `data-starting-style`,
`data-ending-style` and `data-hidden` attributes — the panel keeps itself visible until the transition
finishes.

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
                <div
                    class="bg-background text-foreground col-start-1 row-start-1 p-6 text-sm leading-6 opacity-100 transition-opacity duration-300 ease-out outline-none data-[ending-style]:opacity-0 data-[hidden]:opacity-0 data-[starting-style]:opacity-0"
                    rdxTabsPanel
                    value="account"
                >
                    Make changes to your account here. Click save when you're done.
                </div>
                <div
                    class="bg-background text-foreground col-start-1 row-start-1 p-6 text-sm leading-6 opacity-100 transition-opacity duration-300 ease-out outline-none data-[ending-style]:opacity-0 data-[hidden]:opacity-0 data-[starting-style]:opacity-0"
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
