// This code is an adaptation of code from https://ui.shadcn.com/docs.

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    EventEmitter,
    input,
    model,
    Output
} from '@angular/core';
import {
    RdxCheckboxDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective
} from '@radix-ng/primitives/checkbox';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule } from 'lucide-angular';

const variants = cva('flex');

@Component({
    selector: 'sh-checkbox',
    standalone: true,
    imports: [
        RdxCheckboxDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
        RdxCheckboxInputDirective
    ],
    host: {
        '[class]': 'computedClass()',

        // set to null on host element
        '[attr.id]': 'null'
    },
    template: `
        <button
            class="border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer h-4 w-4 shrink-0 rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            [checked]="checked()"
            [indeterminate]="indeterminate()"
            (checkedChange)="onChange($event)"
            CheckboxRoot
        >
            <lucide-angular
                class="flex h-4 items-center justify-center text-current data-[state=unchecked]:hidden"
                [name]="iconName()"
                CheckboxIndicator
            ></lucide-angular>
            <input
                class="cdk-visually-hidden"
                [id]="id()"
                [value]="checked.asReadonly()"
                CheckboxInput
            />
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './checkbox.styles.scss'
})
export class ShCheckboxComponent {
    readonly id = input<string>();

    readonly checked = model<boolean>(false);

    readonly indeterminate = model(false);

    readonly class = input<string>();
    protected computedClass = computed(() => cn(variants({ class: this.class() })));

    protected readonly iconName = model('check');

    @Output()
    checkedChange = new EventEmitter<boolean>();

    constructor() {
        effect(
            () => {
                this.updateIconName();
            },
            { allowSignalWrites: true }
        );
    }

    protected onChange(event: boolean): void {
        this.checked.set(event);
        this.checkedChange.emit(event);

        this.updateIconName();
    }

    protected updateIconName(): void {
        this.iconName.set(this.indeterminate() ? 'minus' : 'check');
    }
}
