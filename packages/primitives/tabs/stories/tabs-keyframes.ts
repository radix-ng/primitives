import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-keyframes-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    // The panel contents are mounted only while the tab is active (`*rdxTabsPanelPresence`).
    // On enter the inner element plays `tabs-panel-in`; when the tab is left, the parent panel gets
    // `data-hidden`, so `group-data-[hidden]:animate-tabs-panel-out` runs the exit `@keyframes` and
    // the presence directive waits for `animationend` before unmounting.
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
                <div class="group col-start-1 row-start-1" rdxTabsPanel value="account">
                    <div
                        class="bg-background text-foreground animate-tabs-panel-in group-data-[hidden]:animate-tabs-panel-out p-6 text-sm leading-6 outline-none"
                        *rdxTabsPanelPresence
                    >
                        Make changes to your account here. Click save when you're done.
                    </div>
                </div>
                <div class="group col-start-1 row-start-1" rdxTabsPanel value="password">
                    <div
                        class="bg-background text-foreground animate-tabs-panel-in group-data-[hidden]:animate-tabs-panel-out p-6 text-sm leading-6 outline-none"
                        *rdxTabsPanelPresence
                    >
                        Change your password here. After saving, you'll be logged out.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TabsKeyframesExample {}
