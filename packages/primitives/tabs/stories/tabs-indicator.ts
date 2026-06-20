import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-indicator-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsIndicator],
    template: `
        <div
            class="border-border bg-background text-foreground w-[460px] overflow-hidden rounded-xl border shadow-sm"
            rdxTabsRoot
            defaultValue="overview"
        >
            <div class="border-border bg-muted/30 relative flex border-b" rdxTabsList>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxTabsTab
                    value="overview"
                >
                    Overview
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxTabsTab
                    value="activity"
                >
                    Activity
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
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
            <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="overview">
                A high-level summary of your workspace and recent highlights.
            </div>
            <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="activity">
                Everything that happened recently, in reverse chronological order.
            </div>
            <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="settings">
                Configure preferences, members, and integrations for this workspace.
            </div>
        </div>
    `
})
export class TabsIndicatorExample {}
