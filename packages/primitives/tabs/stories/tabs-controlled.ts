import { Component, computed, signal } from '@angular/core';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValue,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { cn, demoButton } from '../../storybook/styles';

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
                    <button [class]="tabClass" value="account" rdxTabsTab>Account</button>
                    <button [class]="tabClass" value="security" rdxTabsTab>Security</button>
                </div>
                <div class="border-border rounded border p-4" value="account" rdxTabsPanel>Manage your account.</div>
                <div class="border-border rounded border p-4" value="security" rdxTabsPanel>
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
    readonly tabClass = cn(
        demoButton.base,
        demoButton.ghost,
        demoButton.size.sm,
        'data-active:bg-primary data-active:text-primary-foreground'
    );
    request({ eventDetails }: RdxTabsValueChangeEvent) {
        this.requests.update((count) => count + 1);
        if (this.blocked()) eventDetails.cancel();
    }
}
