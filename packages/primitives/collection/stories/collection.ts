import { Component, effect, input } from '@angular/core';
import { RdxCollectionItem } from '../src/collection-item';
import { RdxCollectionProvider } from '../src/collection-provider';
import { useCollection } from '../src/use-collection';

@Component({
    selector: 'collection-option',
    template: `
        <ng-content />
    `,
    host: {
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    },
    hostDirectives: [
        {
            directive: RdxCollectionItem,
            inputs: ['value']
        }
    ]
})
export class Option {
    disabled = input(false);
}

@Component({
    selector: 'collection-list',
    imports: [Option],
    hostDirectives: [{ directive: RdxCollectionProvider }],
    template: `
        <div class="flex w-full flex-col sm:w-[150px]">
            @for (option of options; track $index) {
                <collection-option
                    class="flex items-center justify-center gap-2 p-0.5 font-medium text-white"
                    [value]="option"
                    [disabled]="option.disabled"
                >
                    {{ option.label }}
                </collection-option>
            }
        </div>

        <button
            class="text-grass11 dark:focus:shadow-green8 inline-flex h-[35px] items-center justify-center rounded-md border bg-white px-[15px] text-sm font-semibold leading-none shadow-sm outline-none transition-all hover:bg-white/90 focus:shadow-[0_0_0_2px] focus:shadow-black"
            (click)="log()"
        >
            Log getItems()
        </button>
    `
})
export class List {
    readonly options = [
        { label: 'One', value: 1, disabled: false },
        { label: 'Two', value: 2, disabled: true },
        { label: 'Three', value: 3, disabled: false }
    ];

    readonly getItems: ReturnType<typeof useCollection>['getItems'];

    constructor() {
        const { getItems } = useCollection();
        this.getItems = getItems;

        effect(() => {
            console.log('count:', this.getItems(true).length);
        });
    }

    log() {
        console.log(this.getItems());
    }
}
