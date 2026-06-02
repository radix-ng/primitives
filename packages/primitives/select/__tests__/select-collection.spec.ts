import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCollectionProvider } from '@radix-ng/primitives/collection';
import { _importsSelect } from '../index';
import { RdxSelectContent } from '../src/select-content';
import { RdxSelectRoot } from '../src/select-root';

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

            <div rdxSelectPortal>
                <ng-template rdxSelectPortalPresence>
                    <div rdxSelectContent>
                        <div rdxSelectPopperPositionWrapper>
                            <div rdxSelectPopperPositionContent>
                                <div rdxSelectViewport>
                                    @for (fruit of fruits(); track fruit.value) {
                                        <div [value]="fruit.value" [disabled]="fruit.disabled" rdxSelectItem>
                                            <span rdxSelectItemText>{{ fruit.label }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
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

describe('Select collection integration', () => {
    let fixture: ComponentFixture<SelectHostComponent>;

    function open(): RdxCollectionProvider {
        const root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
        root.open.set(true);
        fixture.detectChanges();

        const content = fixture.debugElement.query(By.directive(RdxSelectContent));
        return content.injector.get(RdxCollectionProvider);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SelectHostComponent] });
        fixture = TestBed.createComponent(SelectHostComponent);
        fixture.detectChanges();
    });

    it('collects the rendered select items in DOM order', () => {
        const collection = open();

        expect(collection.items().length).toBe(3);
        expect(collection.items().map((item) => item.value())).toEqual(['apple', 'banana', 'blueberry']);
    });

    it('points each collection item at its rendered option element', () => {
        const collection = open();
        const renderedOptions = Array.from(document.querySelectorAll('[rdxSelectItem]')) as HTMLElement[];

        expect(collection.items().map((item) => item.element)).toEqual(renderedOptions);
    });

    it('reacts when options are added or removed', () => {
        const collection = open();
        expect(collection.items().length).toBe(3);

        fixture.componentInstance.fruits.update((fruits) => [
            ...fruits,
            { label: 'Grapes', value: 'grapes', disabled: false }
        ]);
        fixture.detectChanges();
        expect(collection.items().map((item) => item.value())).toEqual(['apple', 'banana', 'blueberry', 'grapes']);

        fixture.componentInstance.fruits.update((fruits) => fruits.filter((fruit) => fruit.value !== 'banana'));
        fixture.detectChanges();
        expect(collection.items().map((item) => item.value())).toEqual(['apple', 'blueberry', 'grapes']);
    });
});
