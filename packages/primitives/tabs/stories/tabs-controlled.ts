import { Component, computed, signal } from '@angular/core';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValue,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';

@Component({
    selector: 'tabs-controlled-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div class="grid w-80 gap-3">
            <label class="flex items-center gap-2 text-sm">
                <input [checked]="blocked()" (change)="blocked.set(!blocked())" type="checkbox" />
                Block changes
            </label>
            <div class="grid gap-3" [(value)]="value" (onValueChange)="request($event)" rdxTabsRoot>
                <div class="flex gap-2" aria-label="Controlled sections" rdxTabsList>
                    <button
                        class="demo-button demo-button-ghost data-active:bg-primary data-active:text-primary-foreground h-8 px-3 text-xs"
                        value="account"
                        rdxTabsTab
                    >
                        Account
                    </button>
                    <button
                        class="demo-button demo-button-ghost data-active:bg-primary data-active:text-primary-foreground h-8 px-3 text-xs"
                        value="security"
                        rdxTabsTab
                    >
                        Security
                    </button>
                </div>
                <div class="border-border border p-4" value="account" rdxTabsPanel>Manage your account.</div>
                <div class="border-border border p-4" value="security" rdxTabsPanel>
                    Update your security preferences.
                </div>
            </div>
            <output class="text-muted-foreground text-sm" data-testid="controlled-value">
                Selected: {{ label() }}
            </output>
            <output class="text-muted-foreground text-sm" data-testid="controlled-requests">
                Requests: {{ requests() }}
            </output>
        </div>
    `
})
export class TabsControlledExample {
    readonly value = signal<RdxTabsValue>('account');
    readonly blocked = signal(false);
    readonly requests = signal(0);
    readonly label = computed(() => {
        const value = this.value();
        return typeof value === 'string' ? value : 'No selection';
    });
    request({ eventDetails }: RdxTabsValueChangeEvent) {
        this.requests.update((count) => count + 1);
        if (this.blocked()) eventDetails.cancel();
    }
}
