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
    selector: 'rdx-tabs-default-example',
    imports: [RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab],
    template: `
        <div class="demo-tabs-root w-[420px] overflow-hidden" rdxTabsRoot defaultValue="account">
            <div class="demo-tabs-list flex" rdxTabsList>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 focus-visible:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="demo-tabs-tab data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 focus-visible:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
            </div>
            <div class="demo-tabs-panel p-6" rdxTabsPanel value="account">
                Make changes to your account here. Click save when you're done.
            </div>
            <div class="demo-tabs-panel p-6" rdxTabsPanel value="password">
                Change your password here. After saving, you'll be logged out.
            </div>
        </div>
    `
})
export class TabsDefaultStory {}
