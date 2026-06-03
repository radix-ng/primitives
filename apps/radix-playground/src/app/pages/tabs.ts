import { DemoPage } from '../shared/demo-page';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

const tab =
    'relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]';

@Component({
    selector: 'app-tabs',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DemoPage, RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <demo-page
            title="Tabs"
            description="A set of layered sections of content—known as tab panels—that are displayed one at a time."
        >
            <div
                class="border-border bg-background text-foreground w-[420px] overflow-hidden rounded-xl border shadow-sm"
                rdxTabsRoot
                defaultValue="account"
            >
                <div class="border-border bg-muted/30 flex border-b" rdxTabsList>
                    <button rdxTabsTab value="account" [class]="tab">Account</button>
                    <button rdxTabsTab value="password" [class]="tab">Password</button>
                </div>
                <div
                    class="bg-background text-foreground p-6 text-sm leading-6 outline-none"
                    rdxTabsPanel
                    value="account"
                >
                    Make changes to your account here. Click save when you're done.
                </div>
                <div
                    class="bg-background text-foreground p-6 text-sm leading-6 outline-none"
                    rdxTabsPanel
                    value="password"
                >
                    Change your password here. After saving, you'll be logged out.
                </div>
            </div>
        </demo-page>
    `
})
export default class TabsPage {
    protected readonly tab = tab;
}
