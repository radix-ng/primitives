import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxTabsList } from '../src/tabs-list';
import { RdxTabsPanel } from '../src/tabs-panel';
import { RdxTabsRoot } from '../src/tabs-root';
import { RdxTabsTab } from '../src/tabs-tab';
import { RdxTabsValue } from '../src/utils';

interface Part {
    key: string;
    value: RdxTabsValue;
    id?: string;
}
@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div [value]="value()" rdxTabsRoot>
            <div rdxTabsList>
                @for (tab of tabs(); track tab.key) {
                    <button [value]="tab.value" [id]="tab.id" [attr.data-key]="tab.key" rdxTabsTab>
                        {{ tab.key }}
                    </button>
                }
            </div>
            @for (panel of panels(); track panel.key) {
                <div [value]="panel.value" [id]="panel.id" [attr.data-key]="panel.key" keepMounted rdxTabsPanel>
                    {{ panel.key }}
                </div>
            }
        </div>
    `
})
class IdentityHost {
    readonly value = signal<RdxTabsValue>(0);
    readonly tabs = signal<Part[]>([
        { key: 'zero', value: 0 },
        { key: 'one', value: 1 }
    ]);
    readonly panels = signal<Part[]>([
        { key: 'zero', value: 0 },
        { key: 'one', value: 1 }
    ]);
}

describe('Tabs native identities', () => {
    let fixture: ComponentFixture<IdentityHost>;
    let host: IdentityHost;
    let element: HTMLElement;
    const tab = (key: string) => element.querySelector<HTMLElement>(`[role="tab"][data-key="${key}"]`)!;
    const panel = (key: string) => element.querySelector<HTMLElement>(`[role="tabpanel"][data-key="${key}"]`)!;
    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [IdentityHost] });
        fixture = TestBed.createComponent(IdentityHost);
        host = fixture.componentInstance;
        element = fixture.nativeElement;
        await fixture.whenStable();
    });

    it('[APG Tabs][WCAG 4.1.2] removes links to absent panels and absent tab labels', async () => {
        expect(tab('zero').getAttribute('aria-controls')).toBe(panel('zero').id);
        host.panels.update((parts) => parts.filter((part) => part.key !== 'zero'));
        await fixture.whenStable();
        expect(tab('zero').hasAttribute('aria-controls')).toBe(false);
        expect(tab('one').getAttribute('aria-controls')).toBe(panel('one').id);

        host.tabs.set([]);
        await fixture.whenStable();
        expect(panel('one').hasAttribute('aria-labelledby')).toBe(false);
    });

    it('[APG Tabs][WCAG 4.1.2] follows authored and changed Tab/Panel ids', async () => {
        host.tabs.update((parts) => parts.map((part) => ({ ...part, id: 'tab-' + part.key })));
        host.panels.update((parts) => parts.map((part) => ({ ...part, id: 'panel-' + part.key })));
        await fixture.whenStable();
        expect(tab('zero').id).toBe('tab-zero');
        expect(panel('zero').id).toBe('panel-zero');
        expect(tab('zero').getAttribute('aria-controls')).toBe('panel-zero');
        expect(panel('zero').getAttribute('aria-labelledby')).toBe('tab-zero');

        host.tabs.update((parts) => parts.map((part) => ({ ...part, id: 'next-tab-' + part.key })));
        host.panels.update((parts) => parts.map((part) => ({ ...part, id: 'next-panel-' + part.key })));
        await fixture.whenStable();
        expect(tab('zero').getAttribute('aria-controls')).toBe('next-panel-zero');
        expect(panel('zero').getAttribute('aria-labelledby')).toBe('next-tab-zero');
        expect(element.querySelector('#tab-zero, #panel-zero')).toBeNull();
    });

    it('generates distinct identities for numeric/string values and preserves them across value edits', async () => {
        host.tabs.set([
            { key: 'zero', value: 1 },
            { key: 'one', value: '1' }
        ]);
        host.panels.set([
            { key: 'zero', value: 1 },
            { key: 'one', value: '1' }
        ]);
        await fixture.whenStable();
        const ids = [tab('zero').id, tab('one').id, panel('zero').id, panel('one').id];
        expect(new Set(ids).size).toBe(4);
        expect(tab('one').getAttribute('aria-controls')).toBe(panel('one').id);

        host.tabs.update((parts) => parts.map((part) => (part.key === 'one' ? { ...part, value: 2 } : part)));
        host.panels.update((parts) => parts.map((part) => (part.key === 'one' ? { ...part, value: 2 } : part)));
        await fixture.whenStable();
        expect([tab('zero').id, tab('one').id, panel('zero').id, panel('one').id]).toEqual(ids);
        expect(tab('one').getAttribute('aria-controls')).toBe(panel('one').id);
    });

    it('keeps the newest same-value registration when an older panel is removed', async () => {
        host.panels.set([
            { key: 'zero', value: 0 },
            { key: 'shadowed', value: 1 },
            { key: 'owner', value: 1 }
        ]);
        await fixture.whenStable();
        expect(panel('shadowed').id).not.toBe(panel('owner').id);
        expect(tab('one').getAttribute('aria-controls')).toBe(panel('owner').id);

        host.panels.update((parts) => [{ key: 'new', value: 1 }, ...parts]);
        await fixture.whenStable();
        const newestId = panel('new').id;
        expect(tab('one').getAttribute('aria-controls')).toBe(newestId);

        host.panels.update((parts) => parts.filter((part) => part.key !== 'owner' && part.key !== 'shadowed'));
        await fixture.whenStable();
        expect(tab('one').getAttribute('aria-controls')).toBe(newestId);
    });

    it('does not restore a shadowed registration on owner removal, then registers it when shown', async () => {
        host.panels.set([
            { key: 'zero', value: 0 },
            { key: 'shadowed', value: 1 },
            { key: 'owner', value: 1 }
        ]);
        await fixture.whenStable();
        host.panels.update((parts) => parts.filter((part) => part.key !== 'owner'));
        await fixture.whenStable();
        expect(tab('one').hasAttribute('aria-controls')).toBe(false);

        host.value.set(1);
        await fixture.whenStable();
        expect(tab('one').getAttribute('aria-controls')).toBe(panel('shadowed').id);
    });

    it('gives a replacement panel its own identity and updates the control target', async () => {
        const oldId = panel('one').id;
        host.panels.update((parts) =>
            parts.map((part) => (part.key === 'one' ? { key: 'replacement', value: 1 } : part))
        );
        await fixture.whenStable();
        expect(panel('replacement').id).not.toBe(oldId);
        expect(tab('one').getAttribute('aria-controls')).toBe(panel('replacement').id);
    });

    it('keeps two instances independent when values repeat and one removes a panel', async () => {
        const second = TestBed.createComponent(IdentityHost);
        await second.whenStable();
        const other = second.nativeElement as HTMLElement;
        const ids = [...element.querySelectorAll('[id]'), ...other.querySelectorAll('[id]')].map((part) => part.id);
        expect(new Set(ids).size).toBe(ids.length);
        const otherTab = other.querySelector<HTMLElement>('[role="tab"][data-key="zero"]')!;
        const otherPanel = other.querySelector<HTMLElement>('[role="tabpanel"][data-key="zero"]')!;

        host.panels.set([]);
        await fixture.whenStable();
        expect(tab('zero').hasAttribute('aria-controls')).toBe(false);
        expect(otherTab.getAttribute('aria-controls')).toBe(otherPanel.id);
    });
});
