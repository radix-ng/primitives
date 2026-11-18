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
