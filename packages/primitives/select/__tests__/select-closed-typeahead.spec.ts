import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsSelect, RdxSelectRoot, RdxSelectValueChangeEvent } from '../index';

interface Option {
    value: unknown;
    label: string;
    disabled?: boolean;
    textValue?: string;
}
@Component({
    imports: [_importsSelect],
    template: `
        <form>
            <div
                [(value)]="value"
                [(open)]="open"
                [items]="options()"
                [disabled]="disabled()"
                [readOnly]="readOnly()"
                [multiple]="multiple()"
                (onValueChange)="changed($event)"
                name="city"
                rdxSelectRoot
            >
                <button [disabled]="triggerDisabled()" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div rdxSelectPositioner>
                        <div rdxSelectPopup>
                            <div rdxSelectList>
                                @for (option of options(); track option.value) {
                                    <div
                                        [value]="option.value"
                                        [disabled]="option.disabled ?? false"
                                        [textValue]="option.textValue ?? ''"
                                        rdxSelectItem
                                    >
                                        <span rdxSelectItemText>{{ option.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
            <button id="after-closed-search" type="button">After</button>
        </form>
    `
})
class Host {
    readonly value = signal<unknown>('amsterdam');
    readonly open = signal(false);
    readonly disabled = signal(false);
    readonly triggerDisabled = signal(false);
    readonly readOnly = signal(false);
    readonly multiple = signal(false);
    readonly keepMounted = signal(false);
    readonly cancel = signal(false);
    readonly events: RdxSelectValueChangeEvent[] = [];
    readonly options = signal<Option[]>([
        { value: 'amsterdam', label: 'Amsterdam' },
        { value: 'berlin', label: 'Berlin' },
        { value: 'bern', label: 'Bern' },
        { value: 'new-york', label: 'New York' },
        { value: 'new-delhi', label: 'New Delhi' },
        { value: 'tokyo', label: 'Tokyo', disabled: true }
    ]);
    changed(event: RdxSelectValueChangeEvent) {
        this.events.push(event);
        if (this.cancel()) event.eventDetails.cancel();
    }
}

describe('Closed Select typeahead', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    let root: RdxSelectRoot;
    const trigger = (): HTMLButtonElement => fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    const popup = () => document.querySelector('[rdxSelectPopup]');
    async function settle() {
        fixture.detectChanges();
        await fixture.whenStable();
        await Promise.resolve();
        fixture.detectChanges();
    }
    function dispatch(key: string, options: KeyboardEventInit = {}) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
        trigger().dispatchEvent(event);
        return event;
    }
    async function key(value: string) {
        const event = dispatch(value);
        await settle();
        return event;
    }
    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
        root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
        trigger().focus();
    });
    afterEach(() => vi.useRealTimers());

    it('does not mount on focus and selects without opening or moving focus', async () => {
        expect(popup()).toBeNull();
        const event = await key('b');
        expect(event.defaultPrevented).toBe(true);
        expect(host.value()).toBe('berlin');
        expect(host.open()).toBe(false);
        expect(trigger()).toHaveFocus();
        expect(trigger()).toHaveTextContent('Berlin');
        expect(host.events[0].eventDetails.reason).toBe('none');
        expect(host.events[0].eventDetails.event).toBe(event);
        expect(new FormData(fixture.nativeElement.querySelector('form')).get('city')).toBe('berlin');
    });
    it('queues rapid multiword input across the first metadata render', async () => {
        for (const character of 'new y') dispatch(character);
        await settle();
        expect(host.value()).toBe('new-york');
        expect(host.open()).toBe(false);
        expect(trigger()).toHaveFocus();
        expect(host.events).toHaveLength(5);
    });
    it('cycles repeated initials and skips disabled options', async () => {
        await key('b');
        await key('b');
        expect(host.value()).toBe('bern');
        await key('z');
        await key('t');
        expect(host.value()).toBe('bern');
    });
    it('cancels publication through the normal value event and continues cycling', async () => {
        host.cancel.set(true);
        await settle();
        await key('b');
        await key('b');
        expect(host.events.map((event) => event.value)).toEqual(['berlin', 'bern']);
        expect(host.value()).toBe('amsterdam');
        expect(root.nativeInput()?.value).toBe('amsterdam');
        expect(trigger()).not.toHaveAttribute('data-dirty');
        expect(host.open()).toBe(false);
    });
    it.each(['disabled', 'readOnly', 'multiple', 'triggerDisabled'] as const)(
        'ignores closed typing when %s',
        async (mode) => {
            host[mode].set(true);
            await settle();
            dispatch('b');
            await settle();
            expect(host.value()).toBe('amsterdam');
            expect(host.events).toEqual([]);
            expect(host.open()).toBe(false);
            expect(popup()).toBeNull();
        }
    );
    it.each([{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }])(
        'ignores non-search input %j',
        async (options) => {
            dispatch('b', options);
            await settle();
            expect(host.value()).toBe('amsterdam');
            expect(popup()).toBeNull();
        }
    );
    it('invalidates a pending read on blur or disable', async () => {
        dispatch('b');
        trigger().dispatchEvent(
            new FocusEvent('blur', { relatedTarget: fixture.nativeElement.querySelector('#after-closed-search') })
        );
        await settle();
        expect(host.value()).toBe('amsterdam');
        dispatch('b');
        host.disabled.set(true);
        await settle();
        expect(host.value()).toBe('amsterdam');
        expect(host.events).toEqual([]);
    });
    it('reads live DOM order on subsequent sessions with retained views', async () => {
        host.keepMounted.set(true);
        await settle();
        await key('b');
        root.resetTypeahead();
        host.value.set('amsterdam');
        host.options.update((options) => [options[0], options[2], options[1], ...options.slice(3)]);
        await settle();
        await key('b');
        expect(host.value()).toBe('bern');
    });
    it('reads changed rendered labels from a retained option without caching its old text', async () => {
        host.keepMounted.set(true);
        await settle();
        host.options.update((options) =>
            options.map((option) => (option.value === 'berlin' ? { ...option, label: 'Paris' } : option))
        );
        await settle();
        await key('p');
        expect(host.value()).toBe('berlin');
        expect(trigger()).toHaveTextContent('Paris');
    });
    it('uses explicit textValue and preserves object reference identity', async () => {
        const city = { id: 1 };
        host.options.set([{ value: city, label: 'Destination', textValue: 'Berlin' }]);
        await settle();
        await key('b');
        expect(host.value()).toBe(city);
        expect(host.events[0].value).toBe(city);
    });
    it('preserves an array-valued item in single mode', async () => {
        const pair = [10, 20];
        host.options.set([{ value: pair, label: 'Pair' }]);
        await settle();
        await key('p');
        expect(host.value()).toBe(pair);
        expect(host.events[0].value).toBe(pair);
        expect(host.open()).toBe(false);
    });
    it('releases temporary views on blur and native reset and discards their query', async () => {
        await key('n');
        expect(popup()).not.toBeNull();
        trigger().dispatchEvent(
            new FocusEvent('blur', { relatedTarget: fixture.nativeElement.querySelector('#after-closed-search') })
        );
        await settle();
        expect(popup()).toBeNull();
        await key('b');
        expect(host.value()).toBe('berlin');
        fixture.nativeElement.querySelector('form').reset();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        await settle();
        expect(host.value()).toBe('amsterdam');
        expect(popup()).toBeNull();
        await key('b');
        expect(host.value()).toBe('berlin');
    });
    it.each(['action', 'model'] as const)(
        'starts a fresh closed query after a %s close without a blur event',
        async (close) => {
            host.open.set(true);
            await settle();
            document
                .querySelector('[rdxSelectPopup]')!
                .dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
            await settle();
            expect(document.querySelector('[rdxSelectItem][data-highlighted]')).toHaveTextContent('New York');
            if (close === 'action') root.close();
            else host.open.set(false);
            await settle();
            await key('b');
            expect(host.value()).toBe('berlin');
            expect(host.open()).toBe(false);
        }
    );
    it('cancels pending search on destruction', async () => {
        dispatch('b');
        fixture.destroy();
        await Promise.resolve();
        await Promise.resolve();
        expect(host.events).toEqual([]);
    });
});
