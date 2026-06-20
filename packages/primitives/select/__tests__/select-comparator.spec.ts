import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect } from '../index';

interface Fruit {
    id: number;
    name: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect],
    template: `
        <div [(value)]="value" [(open)]="open" [isItemEqualToValue]="'id'" [itemToStringLabel]="label" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span #v="rdxSelectedValue" rdxSelectValue placeholder="Select…">{{ v.slotText() }}</span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits; track fruit.id) {
                            <div [value]="fruit" rdxSelectItem>
                                <span rdxSelectItemText>{{ fruit.name }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class Host {
    readonly fruits: Fruit[] = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' }
    ];
    readonly value = signal<Fruit | undefined>(undefined);
    readonly open = signal(false);
    readonly label = (v: Fruit) => v.name;
}

describe('Select isItemEqualToValue / itemToStringLabel', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function valueEl(): HTMLElement {
        return fixture.nativeElement.querySelector('[rdxSelectValue]');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxSelectItem]'));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    });

    it('matches the selected option by the `id` key and labels it via itemToStringLabel', async () => {
        // a distinct object with the same id must still match by key
        host.value.set({ id: 2, name: 'Banana' });
        host.open.set(true);
        await settle();

        expect(items()[1].getAttribute('data-selected')).toBe('');
        expect(items()[0].hasAttribute('data-selected')).toBe(false);
        expect(valueEl().textContent?.trim()).toBe('Banana');
    });

    it('selecting an item stores the option object', async () => {
        host.open.set(true);
        await settle();
        items()[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
        await settle();
        expect(host.value()).toEqual({ id: 1, name: 'Apple' });
    });
});
