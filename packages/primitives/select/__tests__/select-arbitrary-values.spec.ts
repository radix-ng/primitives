import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { itemToStringValue, ItemValueComparator, serializeNativeFormValue } from '@radix-ng/primitives/core';
import { describe, expect, it, vi } from 'vitest';
import { _importsSelect, RdxSelectRoot, RdxSelectValueChangeEvent } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <form>
            <div
                [(value)]="value"
                [(open)]="open"
                [multiple]="multiple()"
                [items]="items()"
                [itemToStringLabel]="label()"
                [itemToStringValue]="serialize()"
                [isItemEqualToValue]="comparator()"
                (onValueChange)="changed($event)"
                name="choice"
                rdxSelectRoot
            >
                <button rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose">
                        {{ display.slotText() }}
                    </span>
                </button>
                <div *rdxSelectPortal rdxSelectPositioner>
                    <div rdxSelectPopup>
                        <div rdxSelectList>
                            @for (option of options(); track $index) {
                                <div [value]="option" rdxSelectItem>
                                    <span rdxSelectItemText>{{ label()(option) }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
class Host {
    readonly value = signal<unknown>(null);
    readonly open = signal(false);
    readonly multiple = signal(false);
    readonly options = signal<readonly unknown[]>([]);
    readonly label = signal<(value: unknown) => string>(String);
    readonly serialize = signal<(value: unknown) => string>(itemToStringValue);
    readonly comparator = signal<ItemValueComparator<unknown> | undefined>(undefined);
    readonly items = computed(() => this.options().map((value) => ({ value, label: this.label()(value) })));
    readonly events: RdxSelectValueChangeEvent[] = [];
    cancel = false;
    changed(event: RdxSelectValueChangeEvent) {
        this.events.push(event);
        if (this.cancel) event.eventDetails.cancel();
    }
}

describe('Select arbitrary item values', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    const settle = async () => {
        await fixture.whenStable();
    };
    const formValues = () => new FormData(fixture.nativeElement.querySelector('form')).getAll('choice');
    const items = () => Array.from(document.querySelectorAll<HTMLElement>('[rdxSelectItem]'));
    const root = () => fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);

    async function setup(options: readonly unknown[], selected: unknown = null, multiple = false) {
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        host.options.set(options);
        host.value.set(selected);
        host.multiple.set(multiple);
        await settle();
    }
    async function choose(index: number) {
        host.open.set(true);
        await settle();
        items()[index].dispatchEvent(new Event('pointerup', { bubbles: true }));
        await settle();
    }

    for (const value of [
        false,
        0,
        0n,
        Symbol('token'),
        new Date('2026-01-01'),
        new Map([['key', 'value']]),
        () => 'action'
    ]) {
        it(`selects and submits ${typeof value === 'object' ? value.constructor.name : typeof value} without coercing the model`, async () => {
            await setup([value]);
            host.open.set(true);
            await settle();
            expect(root().nativeSelectKey()).toBe(itemToStringValue(value));
            await choose(0);
            expect(host.value()).toBe(value);
            expect(host.events.at(-1)?.value).toBe(value);
            expect(formValues()).toEqual([itemToStringValue(value)]);
            expect(fixture.nativeElement.querySelector('[rdxSelectTrigger]')).not.toHaveAttribute('data-placeholder');
        });
    }

    it('uses a Date comparator only for actual items, including an empty initial selection', async () => {
        const date = new Date('2026-01-01');
        await setup([date]);
        const equal = vi.fn((a: unknown, b: unknown) => (a as Date).getTime() === (b as Date).getTime());
        host.comparator.set(equal);
        host.open.set(true);
        await settle();
        expect(equal).not.toHaveBeenCalled();
        expect(items()[0]).not.toHaveAttribute('data-selected');
        host.value.set(new Date(date));
        await settle();
        expect(items()[0]).toHaveAttribute('data-selected', '');
        await choose(0);
        expect(host.value()).toBe(date);
    });

    it('treats a single array as an atomic item for labels, selection, submission and reset', async () => {
        const first = [1, 2] as const;
        const second = [3, 4] as const;
        await setup([first, second], first);
        host.label.set((value) => (value as readonly number[]).join(' / '));
        host.serialize.set((value) => (value as readonly number[]).join(':'));
        await settle();
        expect(fixture.nativeElement.querySelector('[rdxSelectValue]').textContent).toContain('1 / 2');
        expect(formValues()).toEqual(['1:2']);
        host.open.set(true);
        await settle();
        expect(items()[0]).toHaveAttribute('data-selected', '');
        expect(items()[1]).not.toHaveAttribute('data-selected');
        await choose(1);
        expect(host.value()).toBe(second);
        expect(formValues()).toEqual(['3:4']);
        fixture.nativeElement.querySelector('form').reset();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        await settle();
        expect(host.value()).toBe(first);
        expect(formValues()).toEqual(['1:2']);
    });

    it('keeps array-valued items intact in multiple selection and repeated native entries', async () => {
        const first = [1, 2];
        const second = [3, 4];
        await setup([first, second], [first], true);
        host.label.set((value) => (value as number[]).join('/'));
        await settle();
        await choose(1);
        expect(host.value()).toEqual([first, second]);
        expect((host.value() as unknown[])[0]).toBe(first);
        expect((host.value() as unknown[])[1]).toBe(second);
        expect(formValues()).toEqual(['[1,2]', '[3,4]']);
        expect(fixture.nativeElement.querySelector('[rdxSelectValue]').textContent).toContain('1/2, 3/4');
        await choose(0);
        expect(host.value()).toEqual([second]);
    });

    it('preserves symbol identity and a canceled change', async () => {
        const first = Symbol('same');
        const second = Symbol('same');
        await setup([first, second], first);
        host.open.set(true);
        await settle();
        expect(items()[0]).toHaveAttribute('data-selected', '');
        expect(items()[1]).not.toHaveAttribute('data-selected');
        host.cancel = true;
        await choose(1);
        expect(host.value()).toBe(first);
        expect(host.events.at(-1)?.value).toBe(second);
    });

    it('keeps legacy array serialization while allowing an explicit single-item mode', () => {
        const coordinates = [1, 2];
        const serialize = vi.fn((value: readonly number[]) => value.join(':'));
        expect(serializeNativeFormValue(coordinates)).toEqual(['1', '2']);
        expect(serializeNativeFormValue<readonly number[]>(coordinates, serialize, { multiple: false })).toEqual([
            '1:2'
        ]);
        expect(serialize).toHaveBeenCalledWith(coordinates);
    });
});
