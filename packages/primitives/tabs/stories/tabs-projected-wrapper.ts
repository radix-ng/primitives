import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'tabs-projected-wrapper',
    hostDirectives: [RdxTabsRoot],
    imports: [RdxTabsList],
    template: `
        <div class="border-border bg-muted/30 flex border-b" rdxTabsList>
            <ng-content select="[rdxTabsTab]" />
        </div>
        <ng-content />
    `
})
class TabsProjectedWrapper {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tabs-projected-wrapper-example',
    imports: [TabsProjectedWrapper, RdxTabsTab, RdxTabsPanel],
    template: `
        <div class="flex flex-col gap-3">
            <p class="text-muted-foreground text-sm">Focus a tab, then use Arrow, Home, and End keys.</p>
            <tabs-projected-wrapper
                class="border-border bg-background text-foreground block w-[420px] overflow-hidden rounded-xl border shadow-sm"
            >
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="team"
                >
                    Team
                </button>

                <div
                    class="bg-background text-foreground p-6 text-sm leading-6 outline-none"
                    rdxTabsPanel
                    value="account"
                >
                    Make changes to your account here. The first projected tab was selected implicitly.
                </div>
                <div
                    class="bg-background text-foreground p-6 text-sm leading-6 outline-none"
                    rdxTabsPanel
                    value="password"
                >
                    Change your password here. After saving, you'll be logged out.
                </div>
                <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="team">
                    Invite teammates and manage their roles.
                </div>
            </tabs-projected-wrapper>
        </div>
    `
})
export class TabsProjectedWrapperExample {}
