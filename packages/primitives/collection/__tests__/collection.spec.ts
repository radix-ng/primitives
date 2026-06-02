import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCollectionItem } from '../src/collection-item';
import { RdxCollectionProvider } from '../src/collection-provider';

interface OptionData {
    label: string;
    value: number;
    disabled: boolean;
}

// Mirrors the real-world `select` pattern: the collection item is composed via `hostDirectives`,
// not applied directly. This proves `contentChildren` matches host directives.
@Component({
    selector: 'collection-test-option',
    template: `
        <ng-content />
    `,
    hostDirectives: [{ directive: RdxCollectionItem, inputs: ['value', 'disabled'] }]
})
class TestOptionComponent {}

@Component({
    imports: [RdxCollectionProvider, TestOptionComponent],
    template: `
        <div #collection="rdxCollectionProvider" rdxCollectionProvider>
            @for (option of options(); track option.value) {
                <collection-test-option [value]="option.value" [disabled]="option.disabled">
                    {{ option.label }}
                </collection-test-option>
            }
        </div>
    `
})
class HostComponent {
    readonly options = signal<OptionData[]>([
        { label: 'One', value: 1, disabled: false },
        { label: 'Two', value: 2, disabled: true },
        { label: 'Three', value: 3, disabled: false }
    ]);
}

describe('RdxCollectionProvider', () => {
    let fixture: ComponentFixture<HostComponent>;
    let collection: RdxCollectionProvider;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        collection = fixture.debugElement
            .query(By.directive(RdxCollectionProvider))
            .injector.get(RdxCollectionProvider);
    });

    it('collects all items (including host-directive composed ones) in DOM order', () => {
        expect(collection.items().length).toBe(3);
        expect(collection.items().map((item) => item.value())).toEqual([1, 2, 3]);
    });

    it('exposes enabled items via a reactive computed', () => {
        expect(collection.enabledItems().map((item) => item.value())).toEqual([1, 3]);
        expect(collection.getItems().map((item) => item.value())).toEqual([1, 3]);
        expect(collection.getItems(true).map((item) => item.value())).toEqual([1, 2, 3]);
    });

    it('reacts to items added/removed via @for without manual registration', () => {
        fixture.componentInstance.options.update((options) => [
            ...options,
            { label: 'Four', value: 4, disabled: false }
        ]);
        fixture.detectChanges();

        expect(collection.items().map((item) => item.value())).toEqual([1, 2, 3, 4]);

        fixture.componentInstance.options.update((options) => options.filter((option) => option.value !== 2));
        fixture.detectChanges();

        expect(collection.items().map((item) => item.value())).toEqual([1, 3, 4]);
        expect(collection.enabledItems().map((item) => item.value())).toEqual([1, 3, 4]);
    });

    it('reacts to a disabled flag flipping at runtime', () => {
        fixture.componentInstance.options.update((options) =>
            options.map((option) => (option.value === 3 ? { ...option, disabled: true } : option))
        );
        fixture.detectChanges();

        expect(collection.enabledItems().map((item) => item.value())).toEqual([1]);
    });

    it('reads the host element directly off the item instance', () => {
        const elements = collection.items().map((item) => item.element);
        const rendered = Array.from(fixture.nativeElement.querySelectorAll('collection-test-option')) as HTMLElement[];

        expect(elements).toEqual(rendered);
    });
});
