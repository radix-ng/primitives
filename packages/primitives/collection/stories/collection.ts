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
        class: 'block rounded-md border border-border bg-card px-2.5 py-1.5 text-card-foreground shadow-sm',
        '[class.cursor-pointer]': '!disabled()',
        '[class.cursor-not-allowed]': 'disabled()',
        '[class.opacity-50]': 'disabled()'
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
        <div class="flex w-[320px] flex-col gap-3">
            <div class="flex flex-col gap-2" #collection="rdxCollectionProvider" rdxCollectionProvider>
                @for (option of options(); track option.value) {
                    <collection-option
                        [value]="option.value"
                        [disabled]="option.disabled"
                        (click)="toggleDisabled(option)"
                    >
                        <div class="flex flex-col">
                            <span class="text-sm font-medium">{{ option.label }}</span>
                            <span class="text-muted-foreground text-xs">
                                {{ option.disabled ? '(disabled — click to enable)' : 'click to toggle' }}
                            </span>
                        </div>
                    </collection-option>
                }
            </div>

            <div class="text-muted-foreground text-sm tabular-nums">
                <div>items(): {{ collection.items().length }} → [{{ values(collection) }}]</div>
                <div>enabledItems(): {{ collection.enabledItems().length }} → [{{ enabledValues(collection) }}]</div>
            </div>

            <div class="flex gap-2">
                <button
                    class="bg-background text-foreground border-border focus-visible:ring-ring hover:bg-muted cursor-pointer rounded-md border px-2.5 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2"
                    (click)="addOption()"
                    type="button"
                >
                    Add
                </button>
                <button
                    class="bg-background text-foreground border-border focus-visible:ring-ring hover:bg-muted cursor-pointer rounded-md border px-2.5 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2"
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
