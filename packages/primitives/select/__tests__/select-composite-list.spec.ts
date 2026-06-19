import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCompositeList, RdxCompositeMetadata } from '@radix-ng/primitives/composite';
import { _importsSelect } from '../index';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectItemMetadata } from '../src/utils';

interface Fruit {
    label: string;
    value: string;
    disabled: boolean;
}

@Component({
    imports: [_importsSelect],
    template: `
        <div [(value)]="value" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>

            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits(); track fruit.value) {
                            <div [value]="fruit.value" [disabled]="fruit.disabled" rdxSelectItem>
                                <span rdxSelectItemText>{{ fruit.label }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class SelectHostComponent {
    readonly value = signal<string | undefined>(undefined);
    readonly fruits = signal<Fruit[]>([
        { label: 'Apple', value: 'apple', disabled: false },
        { label: 'Banana', value: 'banana', disabled: true },
        { label: 'Blueberry', value: 'blueberry', disabled: false }
    ]);
}

describe('Select composite list integration', () => {
    let fixture: ComponentFixture<SelectHostComponent>;

    async function open(): Promise<RdxCompositeList> {
        const root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
        root.open.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const content = fixture.debugElement.query(By.directive(RdxSelectPopup));
        return content.injector.get(RdxCompositeList);
    }

    function itemValues(list: RdxCompositeList): unknown[] {
        const map = list.itemMap() as Map<HTMLElement, RdxCompositeMetadata<RdxSelectItemMetadata>>;
        return list.items().map((item) => map.get(item.element)?.value);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SelectHostComponent] });
        fixture = TestBed.createComponent(SelectHostComponent);
        fixture.detectChanges();
    });

    it('collects the rendered select items in DOM order', async () => {
        const list = await open();

        expect(list.items().length).toBe(3);
        expect(itemValues(list)).toEqual(['apple', 'banana', 'blueberry']);
    });

    it('points each composite item at its rendered option element', async () => {
        const list = await open();
        const renderedOptions = Array.from(document.querySelectorAll('[rdxSelectItem]')) as HTMLElement[];

        expect(list.items().map((item) => item.element)).toEqual(renderedOptions);
    });

    it('reacts when options are added or removed', async () => {
        const list = await open();
        expect(list.items().length).toBe(3);

        fixture.componentInstance.fruits.update((fruits) => [
            ...fruits,
            { label: 'Grapes', value: 'grapes', disabled: false }
        ]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(itemValues(list)).toEqual(['apple', 'banana', 'blueberry', 'grapes']);

        fixture.componentInstance.fruits.update((fruits) => fruits.filter((fruit) => fruit.value !== 'banana'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(itemValues(list)).toEqual(['apple', 'blueberry', 'grapes']);
    });
});
