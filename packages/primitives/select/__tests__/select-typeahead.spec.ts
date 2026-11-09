import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsSelect, RdxSelectPositioner } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <ng-container
            [(value)]="value"
            [(open)]="open"
            [readOnly]="readOnly()"
            (onValueChange)="changed($event)"
            rdxSelectRoot
        >
            <button rdxSelectTrigger>Destination</button>
            <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                <div rdxSelectPositioner>
                    <div rdxSelectPopup>
                        <div rdxSelectList>
                            @for (city of cities; track city.value) {
                                <div [value]="city.value" [disabled]="city.disabled ?? false" rdxSelectItem>
                                    <span rdxSelectItemText>{{ city.label }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
        <button id="outside-search" type="button">After</button>
    `
})
class Host {
    readonly value = signal<string | null | undefined>('amsterdam');
    readonly open = signal(true);
    readonly readOnly = signal(false);
    readonly keepMounted = signal(true);
    readonly changed = vi.fn();
    readonly cities: { value: string; label: string; disabled?: boolean }[] = [
        { value: 'amsterdam', label: 'Amsterdam' },
        { value: 'berlin', label: 'Berlin' },
        { value: 'bern', label: 'Bern' },
        { value: 'new-york', label: 'New York' },
        { value: 'newark', label: 'Newark' },
        { value: 'new-delhi', label: 'New Delhi' },
        { value: 'tokyo', label: 'Tokyo', disabled: true }
    ];
}

describe('Select typeahead sessions', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    const popup = () => document.querySelector<HTMLElement>('[rdxSelectPopup]')!;
    const highlighted = () =>
        document.querySelector<HTMLElement>('[rdxSelectItem][data-highlighted]')?.textContent?.trim();
    async function settle() {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    async function key(value: string, options: KeyboardEventInit = {}) {
        const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options });
        popup().dispatchEvent(event);
        await settle();
        return event;
    }
    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    });
    afterEach(() => vi.useRealTimers());

    it('uses Space in multiword queries without committing and Enter selects the result', async () => {
        for (const character of 'new d') expect((await key(character)).defaultPrevented).toBe(true);
        expect(highlighted()).toBe('New Delhi');
        expect(host.value()).toBe('amsterdam');
        expect(host.open()).toBe(true);
        expect(host.changed).not.toHaveBeenCalled();
        await key('Enter');
        expect(host.value()).toBe('new-delhi');
        expect(host.open()).toBe(false);
        expect(host.changed).toHaveBeenCalledOnce();
    });
    it('starts a new session after the selected value, independently of the arrow highlight', async () => {
        await key('End');
        expect(highlighted()).toBe('Tokyo');
        await key('b');
        expect(highlighted()).toBe('Berlin');
        await key('b');
        expect(highlighted()).toBe('Bern');
    });
    it('drops an unmatched query without waiting for its timeout', async () => {
        await key('z');
        await key('b');
        expect(highlighted()).toBe('Berlin');
    });
    it('retains an uncommitted leading Space on a disabled option, then recovers after a miss', async () => {
        await key('End');
        await key(' ');
        await key('b');
        expect(highlighted()).toBe('Tokyo');
        await key('b');
        expect(highlighted()).toBe('Berlin');
        expect(host.value()).toBe('amsterdam');
        expect(host.open()).toBe(true);
    });
    it('resets after 750ms and restores Space activation', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        await key('n');
        vi.advanceTimersByTime(749);
        await key(' ');
        expect(host.open()).toBe(true);
        vi.advanceTimersByTime(750);
        await key(' ');
        expect(host.value()).toBe('new-york');
        expect(host.open()).toBe(false);
    });
    it.each([false, true])('resets on close/reopen with keepMounted=%s', async (retained) => {
        host.keepMounted.set(retained);
        await settle();
        await key('n');
        host.open.set(false);
        await settle();
        host.open.set(true);
        await settle();
        await key('b');
        expect(highlighted()).toBe('Berlin');
    });
    it('keeps a typed highlight when a retained positioner reports placement again', async () => {
        await key('n');
        expect(highlighted()).toBe('New York');
        fixture.debugElement.query(By.directive(RdxSelectPositioner)).injector.get(RdxSelectPositioner).placed.emit();
        await settle();
        expect(highlighted()).toBe('New York');
        for (const character of 'ew d') await key(character);
        expect(highlighted()).toBe('New Delhi');
    });
    it('resets when the selected value changes externally', async () => {
        await key('n');
        host.value.set('berlin');
        await settle();
        await key('b');
        expect(highlighted()).toBe('Bern');
    });
    it('resets when focus leaves the composite', async () => {
        await key('n');
        popup().dispatchEvent(
            new FocusEvent('focusout', { bubbles: true, relatedTarget: document.querySelector('#outside-search') })
        );
        await key('b');
        expect(highlighted()).toBe('Berlin');
    });
    it('browses read-only options without committing them', async () => {
        host.readOnly.set(true);
        await settle();
        for (const character of 'new y') await key(character);
        expect(highlighted()).toBe('New York');
        await key('Enter');
        expect(host.value()).toBe('amsterdam');
        expect(host.open()).toBe(true);
        expect(host.changed).not.toHaveBeenCalled();
    });
    it.each([{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }])(
        'ignores non-search input %j',
        async (options) => {
            await key('n', options);
            await key('b');
            expect(highlighted()).toBe('Berlin');
        }
    );
});
