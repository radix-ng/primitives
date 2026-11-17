import { Component, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import {
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '..';

@Injectable()
class Children {
    created = 0;
    destroyed = 0;
    received = 0;
    readonly events = new Subject<void>();
}
@Component({ selector: 'panel-child', template: '<input aria-label="Child state" value="initial" />' })
class PanelChild {
    constructor() {
        const children = inject(Children);
        children.created++;
        children.events.pipe(takeUntilDestroyed()).subscribe(() => children.received++);
        inject(DestroyRef).onDestroy(() => children.destroyed++);
    }
}
@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective,
        PanelChild
    ],
    providers: [Children],
    template: `
        @if (showRoot()) {
            <div [defaultValue]="defaults()" [keepMounted]="keep()" [hiddenUntilFound]="findable()" rdxAccordionRoot>
                @for (row of rows(); track row) {
                    <div [value]="row" rdxAccordionItem>
                        <button [attr.data-testid]="row + '-trigger'" rdxAccordionTrigger>{{ row }}</button>
                        @if (showPanel()) {
                            <div
                                *rdxAccordionPanelPresence="{ keepMounted: panelKeep() }"
                                [attr.data-testid]="row + '-panel'"
                                rdxAccordionPanel
                            >
                                <panel-child />
                            </div>
                        }
                    </div>
                }
            </div>
        }
    `
})
class Host {
    readonly defaults = signal<unknown[]>([]);
    readonly keep = signal(false);
    readonly panelKeep = signal<boolean | undefined>(undefined);
    readonly findable = signal(false);
    readonly showRoot = signal(true);
    readonly showPanel = signal(true);
    readonly rows = signal(['a', 'b']);
}
function setup(configure?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    configure?.(host);
    fixture.detectChanges();
    const children = fixture.debugElement.injector.get(Children);
    const panel = (id = 'a') =>
        fixture.nativeElement.querySelector(`[data-testid="${id}-panel"]`) as HTMLElement | null;
    const input = () => panel()?.querySelector('input');
    const click = (id = 'a') => {
        (fixture.nativeElement.querySelector(`[data-testid="${id}-trigger"]`) as HTMLElement).click();
        fixture.detectChanges();
    };
    return { fixture, host, children, panel, input, click };
}

describe('Accordion whole Panel view ownership', () => {
    it('does not construct children or subscriptions while initially closed', () => {
        const { children, panel } = setup();
        expect(panel()).toBeNull();
        expect(children.created).toBe(0);
        expect(children.events.observed).toBe(false);
    });
    it('destroys children and subscriptions on close and creates fresh native state on return', async () => {
        const { fixture, children, panel, input, click } = setup();
        click();
        const original = input()!;
        original.value = 'edited';
        children.events.next();
        expect(children.received).toBe(1);
        click();
        await fixture.whenStable();
        expect(panel()).toBeNull();
        expect(children.destroyed).toBe(1);
        expect(children.events.observed).toBe(false);
        children.events.next();
        expect(children.received).toBe(1);
        click();
        expect(input()).not.toBe(original);
        expect(input()!.value).toBe('initial');
        expect(children.created).toBe(2);
    });
    it('suppresses only the initial open lifecycle, then restores animation on a recreated host', async () => {
        const { fixture, panel, click } = setup((host) => host.defaults.set(['a']));
        expect(panel()!.style.animationName).toBe('none');
        click();
        await fixture.whenStable();
        click();
        expect(panel()!.style.animationName).toBe('');
    });
    it('allows the first user opening after an initially closed structural template to animate', () => {
        const { panel, click } = setup();
        click();
        expect(panel()!.style.animationName).toBe('');
    });
    it('retains the entire view and subscriptions with keepMounted', async () => {
        const { fixture, children, panel, input, click } = setup((host) => host.keep.set(true));
        expect(children.created).toBe(2);
        const original = input()!;
        original.value = 'edited';
        click();
        click();
        await fixture.whenStable();
        expect(panel()!.hidden).toBe(true);
        expect(children.destroyed).toBe(0);
        children.events.next();
        expect(children.received).toBe(2);
        click();
        expect(input()).toBe(original);
        expect(input()!.value).toBe('edited');
    });
    it('retains findable content even with an explicit false keepMounted override', () => {
        const { fixture, children, panel, input } = setup((host) => {
            host.findable.set(true);
            host.panelKeep.set(false);
        });
        expect(children.created).toBe(2);
        const original = input();
        expect(panel()!.getAttribute('hidden')).toBe('until-found');
        panel()!.dispatchEvent(new Event('beforematch'));
        fixture.detectChanges();
        expect(panel()!.hidden).toBe(false);
        expect(input()).toBe(original);
    });
    it('reacts to explicit false and removed per-panel overrides without constructing disposable children', () => {
        const { host, fixture, children, panel } = setup((host) => {
            host.keep.set(true);
            host.panelKeep.set(false);
        });
        expect(panel()).toBeNull();
        expect(children.created).toBe(0);
        host.panelKeep.set(undefined);
        fixture.detectChanges();
        expect(panel()!.hidden).toBe(true);
        expect(children.created).toBe(2);
        host.keep.set(false);
        fixture.detectChanges();
        expect(panel()).toBeNull();
        expect(children.destroyed).toBe(2);
    });
    it('preserves generated IDs through recreation and clears registrations on conditional removal', async () => {
        const { host, fixture, panel, click } = setup();
        click();
        const id = panel()!.id;
        click();
        await fixture.whenStable();
        click();
        expect(panel()!.id).toBe(id);
        host.showPanel.set(false);
        fixture.detectChanges();
        const trigger = fixture.nativeElement.querySelector('[data-testid="a-trigger"]') as HTMLElement;
        expect(trigger.getAttribute('aria-controls')).toBeNull();
        host.showPanel.set(true);
        fixture.detectChanges();
        expect(panel()!.id).toBe(id);
        expect(trigger.getAttribute('aria-controls')).toBe(id);
    });
    it('moves live item views in @for and destroys only removed views', () => {
        const { host, fixture, children, input, click } = setup();
        click();
        const original = input();
        host.rows.set(['b', 'a']);
        fixture.detectChanges();
        expect(input()).toBe(original);
        expect(children.created).toBe(1);
        host.rows.set(['b']);
        fixture.detectChanges();
        expect(children.destroyed).toBe(1);
        fixture.destroy();
        expect(children.destroyed).toBe(1);
    });
    it('holds a live child through exit and ignores stale completion after a rapid reopen', async () => {
        const { fixture, children, panel, input, click } = setup();
        click();
        const original = input()!;
        original.value = 'edited';
        let finish!: () => void;
        const finished = new Promise<void>((resolve) => {
            finish = resolve;
        });
        panel()!.getAnimations = vi.fn().mockReturnValue([{ finished, playState: 'running' }]);
        click();
        expect(panel()).not.toBeNull();
        expect(children.destroyed).toBe(0);
        click();
        finish();
        await Promise.resolve();
        await fixture.whenStable();
        expect(input()).toBe(original);
        expect(input()!.value).toBe('edited');
        expect(children.destroyed).toBe(0);
        fixture.destroy();
        expect(children.destroyed).toBe(1);
    });
    it('destroys a pending exit exactly once when Root is removed', () => {
        const { host, fixture, children, panel, click } = setup();
        click();
        panel()!.getAnimations = vi.fn().mockReturnValue([{ finished: new Promise(() => {}), playState: 'running' }]);
        click();
        host.showRoot.set(false);
        fixture.detectChanges();
        expect(children.destroyed).toBe(1);
        expect(children.events.observed).toBe(false);
        fixture.destroy();
        expect(children.destroyed).toBe(1);
    });
});

@Component({
    imports: [RdxAccordionRootDirective, RdxAccordionItemDirective, RdxAccordionPanelDirective],
    template: '<div rdxAccordionRoot><div rdxAccordionItem><div rdxAccordionPanel>Missing owner</div></div></div>'
})
class MissingOwnerHost {}
@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div [defaultValue]="['outer']" rdxAccordionRoot>
            <div rdxAccordionItem value="outer">
                <button rdxAccordionTrigger data-testid="outer-trigger">Outer</button>
                <div *rdxAccordionPanelPresence rdxAccordionPanel>
                    <div rdxAccordionRoot>
                        <div rdxAccordionItem value="inner">
                            <button rdxAccordionTrigger data-testid="inner-trigger">Inner</button>
                            <div *rdxAccordionPanelPresence rdxAccordionPanel>Inner contents</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class NestedHost {}

describe('Accordion Panel ownership boundary', () => {
    it('diagnoses a native Panel without the required structural owner', () => {
        expect(() => TestBed.createComponent(MissingOwnerHost).detectChanges()).toThrow('[rdx:accordion/panel-owner]');
    });
    it('keeps nested Items inside their own Root and structural lifetime', () => {
        const fixture = TestBed.createComponent(NestedHost);
        fixture.detectChanges();
        const panels = () => fixture.nativeElement.querySelectorAll('[rdxAccordionPanel]');
        expect(panels()).toHaveLength(1);
        fixture.nativeElement.querySelector('[data-testid="inner-trigger"]').click();
        fixture.detectChanges();
        expect(panels()).toHaveLength(2);
        fixture.nativeElement.querySelector('[data-testid="outer-trigger"]').click();
        fixture.detectChanges();
        expect(panels()).toHaveLength(0);
    });
});
