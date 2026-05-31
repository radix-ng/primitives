import { Component, input, signal } from '@angular/core';
import { RdxCollectionItem } from '../src/collection-item';
import { RdxCollectionProvider } from '../src/collection-provider';

interface OptionData {
    label: string;
    value: number;
    disabled: boolean;
}

@Component({
    selector: 'collection-option',
    template: `
        <ng-content />
    `,
    host: {
        class: 'block rounded-md border border-white/40 px-2.5 py-1.5',
        '[class.cursor-pointer]': '!disabled()',
        '[class.cursor-not-allowed]': 'disabled()',
        '[class.opacity-45]': 'disabled()'
    },
    hostDirectives: [
        {
            directive: RdxCollectionItem,
            inputs: ['value', 'disabled']
        }
    ]
})
export class Option {
    readonly disabled = input(false);
}

@Component({
    selector: 'collection-list',
    imports: [Option, RdxCollectionProvider],
    template: `
        <div class="flex w-[280px] flex-col gap-3 font-sans text-white">
            <div class="flex flex-col gap-1" #collection="rdxCollectionProvider" rdxCollectionProvider>
                @for (option of options(); track option.value) {
                    <collection-option
                        [value]="option.value"
                        [disabled]="option.disabled"
                        (click)="toggleDisabled(option)"
                    >
                        {{ option.label }} {{ option.disabled ? '(disabled — click to enable)' : '' }}
                    </collection-option>
                }
            </div>

            <div class="tabular-nums">
                <div>items(): {{ collection.items().length }} → [{{ values(collection) }}]</div>
                <div>enabledItems(): {{ collection.enabledItems().length }} → [{{ enabledValues(collection) }}]</div>
            </div>

            <div class="flex gap-2">
                <button
                    class="cursor-pointer rounded-md border border-white/40 bg-transparent px-2.5 py-1 text-inherit"
                    (click)="addOption()"
                    type="button"
                >
                    Add
                </button>
                <button
                    class="cursor-pointer rounded-md border border-white/40 bg-transparent px-2.5 py-1 text-inherit"
                    (click)="removeLast()"
                    type="button"
                >
                    Remove last
                </button>
            </div>
        </div>
    `
})
export class List {
    private nextValue = 4;

    readonly options = signal<OptionData[]>([
        { label: 'One', value: 1, disabled: false },
        { label: 'Two', value: 2, disabled: true },
        { label: 'Three', value: 3, disabled: false }
    ]);

    readonly values = (collection: RdxCollectionProvider) =>
        collection
            .items()
            .map((item) => item.value())
            .join(', ');
    readonly enabledValues = (collection: RdxCollectionProvider) =>
        collection
            .enabledItems()
            .map((item) => item.value())
            .join(', ');

    addOption() {
        const value = this.nextValue++;
        this.options.update((options) => [...options, { label: `Item ${value}`, value, disabled: false }]);
    }

    removeLast() {
        this.options.update((options) => options.slice(0, -1));
    }

    toggleDisabled(option: OptionData) {
        this.options.update((options) =>
            options.map((o) => (o.value === option.value ? { ...o, disabled: !o.disabled } : o))
        );
    }
}
