import { Component, getDebugNode, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AcceptableValue, ItemValueComparator } from '@radix-ng/primitives/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect, RdxSelectItems, RdxSelectPositioner, RdxSelectRoot } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <form>
            <div
                [(value)]="value"
                [(open)]="open"
                [multiple]="multiple()"
                [defaultValue]="defaultValue()"
                [items]="items()"
                [highlightItemOnHover]="hover()"
                [isItemEqualToValue]="comparator()"
                [itemToStringLabel]="label()"
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
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
class ParityHost {
    readonly value = signal<AcceptableValue | AcceptableValue[] | undefined>(undefined);
    readonly open = signal(false);
    readonly multiple = signal(false);
    readonly defaultValue = signal<AcceptableValue | AcceptableValue[] | undefined>(undefined);
    readonly items = signal<RdxSelectItems | undefined>(undefined);
    readonly options = signal<AcceptableValue[]>(['a', 'b', 'c']);
    readonly hover = signal(true);
    readonly comparator = signal<ItemValueComparator<AcceptableValue> | undefined>(undefined);
    readonly label = signal<((value: AcceptableValue) => string) | undefined>(undefined);
}

describe('Select Base UI 1.9 source-contract scenarios', () => {
    let fixture: ComponentFixture<ParityHost>;
    let host: ParityHost;

    beforeEach(() => TestBed.configureTestingModule({ imports: [ParityHost] }));

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    async function mount(configure: (host: ParityHost) => void = () => undefined): Promise<void> {
        fixture = TestBed.createComponent(ParityHost);
        host = fixture.componentInstance;
        configure(host);
        await settle();
    }

    const text = () => fixture.nativeElement.querySelector('[rdxSelectValue]').textContent.trim();
    const root = () => fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
    const options = (): HTMLElement[] => Array.from(document.querySelectorAll('[rdxSelectItem]'));

    it('uses center alignment by default for the anchored popup', async () => {
        await mount((instance) => instance.open.set(true));
        const positioner = getDebugNode(document.querySelector('[rdxSelectPositioner]'))!.injector.get(
            RdxSelectPositioner
        );
        expect(positioner.align()).toBe('center');
    });

    it('initializes empty single selection to null and empty multiple selection to an array', async () => {
        await mount();
        expect(root().value()).toBeNull();
        expect(text()).toBe('Choose');
        fixture.destroy();
        await mount((instance) => instance.multiple.set(true));
        expect(root().value()).toEqual([]);
    });

    it('seeds a default once and does not overwrite an explicit controlled null', async () => {
        await mount((instance) => instance.defaultValue.set('a'));
        expect(host.value()).toBe('a');
        root().setValue('b');
        host.defaultValue.set('c');
        await settle();
        expect(host.value()).toBe('b');
        fixture.destroy();
        await mount((instance) => {
            instance.value.set(null);
            instance.defaultValue.set('a');
        });
        expect(host.value()).toBeNull();
    });

    for (const items of [
        { a: 'Alpha', b: 'Beta' },
        [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' }
        ],
        [
            {
                name: 'Letters',
                items: [
                    { value: 'a', label: 'Alpha' },
                    { value: 'b', label: 'Beta' }
                ]
            }
        ]
    ] satisfies RdxSelectItems[]) {
        it(`resolves ${Array.isArray(items) ? ('items' in items[0] ? 'grouped' : 'flat') : 'record'} labels before items mount`, async () => {
            await mount((instance) => {
                instance.value.set('b');
                instance.items.set(items);
            });
            expect(options()).toHaveLength(0);
            expect(text()).toBe('Beta');
            host.open.set(true);
            await settle();
            host.open.set(false);
            await settle();
            expect(text()).toBe('Beta');
        });
    }

    it('updates labels with the items signal without emitting a selection change', async () => {
        await mount((instance) => {
            instance.value.set('a');
            instance.items.set({ a: 'Alpha' });
        });
        let changes = 0;
        root().onValueChange.subscribe(() => changes++);
        host.items.set({ a: 'A translated label' });
        await settle();
        expect(text()).toBe('A translated label');
        expect(changes).toBe(0);
    });

    it('prefers the callback and explicit object label, and uses record labels for primitive keys', async () => {
        await mount((instance) => {
            instance.value.set({ value: 'a', label: 'Object label' });
            instance.items.set({ a: 'Record label' });
        });
        expect(text()).toBe('Object label');
        host.label.set(() => 'Callback label');
        await settle();
        expect(text()).toBe('Callback label');
        host.label.set(undefined);
        host.value.set({ value: 'a' });
        await settle();
        expect(text()).toBe('a');
        host.value.set('a');
        await settle();
        expect(text()).toBe('Record label');
    });

    for (const multiple of [false, true]) {
        it(`restores the empty ${multiple ? 'multiple' : 'single'} default on native form reset`, async () => {
            await mount((instance) => {
                instance.multiple.set(multiple);
                instance.defaultValue.set(null);
            });
            const emptyValue = multiple ? [] : null;
            expect(root().value()).toEqual(emptyValue);
            root().setValue('a');
            await settle();
            fixture.nativeElement.querySelector('form').reset();
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            await settle();
            expect(root().value()).toEqual(emptyValue);
            expect(text()).toBe('Choose');
        });
    }

    it('uses Object.is semantics for NaN and signed zero', async () => {
        await mount((instance) => {
            instance.value.set(NaN);
            instance.options.set([NaN, -0, 0]);
            instance.open.set(true);
        });
        expect(options()[0].hasAttribute('data-selected')).toBe(true);
        host.value.set(-0);
        await settle();
        expect(options()[1].hasAttribute('data-selected')).toBe(true);
        expect(options()[2].hasAttribute('data-selected')).toBe(false);
    });

    it('matches an object value member against flat or grouped item descriptors', async () => {
        await mount((instance) => {
            instance.value.set({ value: 'a' });
            instance.items.set([{ items: [{ value: 'a', label: 'Alpha' }] }]);
        });
        expect(text()).toBe('Alpha');
    });

    it('lets a labeled null option override the placeholder and retains zero/empty labels', async () => {
        await mount((instance) => instance.items.set([{ value: null, label: 'None' }]));
        expect(text()).toBe('None');
        host.items.set([
            { value: 'a', label: '' },
            { value: 'b', label: 0 }
        ]);
        host.multiple.set(true);
        host.value.set(['a', 'b']);
        await settle();
        expect(text()).toBe(', 0');
    });

    it('does not read inherited labels from a record', async () => {
        await mount((instance) => {
            instance.value.set('toString');
            instance.items.set({});
        });
        expect(text()).toBe('toString');
    });

    it('uses reference equality for object selection and honors an explicit comparator', async () => {
        const option = { id: 1 };
        await mount((instance) => {
            instance.value.set({ id: 1 });
            instance.options.set([option]);
            instance.open.set(true);
        });
        expect(options()[0].hasAttribute('data-selected')).toBe(false);
        host.value.set(option);
        await settle();
        expect(options()[0].hasAttribute('data-selected')).toBe(true);
        host.value.set({ id: 1 });
        host.comparator.set('id');
        await settle();
        expect(options()[0].hasAttribute('data-selected')).toBe(true);
    });

    it('honors custom equality for string values too', async () => {
        await mount((instance) => {
            instance.value.set('A');
            instance.comparator.set((a, b) => String(a).toLowerCase() === String(b).toLowerCase());
            instance.open.set(true);
        });
        expect(options()[0].hasAttribute('data-selected')).toBe(true);
    });

    it('keeps keyboard highlight on pointer move/leave when hover highlighting is disabled', async () => {
        await mount((instance) => {
            instance.hover.set(false);
            instance.open.set(true);
        });
        document
            .querySelector('[rdxSelectPopup]')
            ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();
        const highlighted = document.querySelector('[rdxSelectItem][data-highlighted]');
        expect(highlighted).not.toBeNull();
        options()[2].dispatchEvent(new MouseEvent('pointermove', { bubbles: true, movementX: 2 }));
        highlighted?.dispatchEvent(new Event('pointerleave'));
        await settle();
        expect(document.querySelector('[rdxSelectItem][data-highlighted]')).toBe(highlighted);
        options()[2].dispatchEvent(new Event('pointerup', { bubbles: true }));
        await settle();
        expect(host.value()).toBe('c');
    });
});
