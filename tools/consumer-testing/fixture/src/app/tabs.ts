import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'consumer-tabs',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [{ directive: RdxTabsRoot, inputs: ['value'], outputs: ['valueChange'] }],
    imports: [RdxTabsList],
    template: `
        <div class="tabs-list" aria-label="Account settings" rdxTabsList>
            <ng-content select="[rdxTabsTab]" />
        </div>
        <ng-content />
    `
})
class TabsWrapper {}

@Component({
    selector: 'consumer-tabs-task',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TabsWrapper, RdxTabsTab, RdxTabsPanel],
    template: `
        <consumer-tabs [(value)]="active">
            <button rdxTabsTab value="account">Account</button>
            <button rdxTabsTab value="password">Password</button>
            <button rdxTabsTab value="team">Team</button>
            <div class="panel" rdxTabsPanel value="account">Edit your account.</div>
            <div class="panel" rdxTabsPanel value="password">Change your password.</div>
            <div class="panel" rdxTabsPanel value="team">Invite teammates.</div>
        </consumer-tabs>
        <output aria-label="Active tab">{{ active() }}</output>
        <button type="button">After tabs</button>
    `
})
export class TabsTask {
    readonly active = signal('account');
}
