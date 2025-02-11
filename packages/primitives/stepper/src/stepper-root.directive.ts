import { Direction } from '@angular/cdk/bidi';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    forwardRef,
    input,
    model,
    numberAttribute,
    signal
} from '@angular/core';
import { STEPPER_ROOT_CONTEXT } from './stepper-root-context.token';

@Directive({
    selector: '[rdxStepperRoot]',
    exportAs: 'rdxStepperRoot',
    providers: [
        {
            provide: STEPPER_ROOT_CONTEXT,
            useExisting: forwardRef(() => RdxStepperRootDirective)
        }
    ],
    host: {
        role: 'group',
        '[attr.aria-label]': '"progress"',
        '[attr.data-linear]': 'linear() ? "" : undefined',
        '[attr.data-orientation]': 'orientation()'
    }
})
export class RdxStepperRootDirective {
    readonly defaultValue = input<number, NumberInput>(undefined, { transform: numberAttribute });

    readonly value = model<number | undefined>(this.defaultValue());

    readonly linear = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    readonly dir = input<Direction>('ltr');

    readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

    readonly totalStepperItemsArray = computed(() => Array.from(this.totalStepperItems()));

    readonly isFirstStep = computed(() => this.value() === 1);
    readonly isLastStep = computed(() => this.value() === this.totalStepperItemsArray().length);

    readonly totalSteps = computed(() => this.totalStepperItems().length);

    readonly isNextDisabled = computed<boolean>(() => {
        const item = this.nextStepperItem();
        return item ? item.hasAttribute('disabled') : true;
    });

    readonly isPrevDisabled = computed<boolean>(() => {
        const item = this.prevStepperItem();
        return item ? item.hasAttribute('disabled') : true;
    });

    readonly totalStepperItems = signal<HTMLElement[]>([]);

    private readonly nextStepperItem = signal<HTMLElement | null>(null);
    private readonly prevStepperItem = signal<HTMLElement | null>(null);

    constructor() {
        effect(() => {
            const items = this.totalStepperItemsArray();
            const currentValue = this.value();

            if (currentValue) {
                if (items.length && currentValue < items.length) {
                    this.nextStepperItem.set(items[currentValue]);
                } else {
                    this.nextStepperItem.set(null);
                }

                if (items.length && currentValue > 1) {
                    this.prevStepperItem.set(items[currentValue - 2]);
                } else {
                    this.prevStepperItem.set(null);
                }
            }
        });
    }

    goToStep(step: number) {
        if (step > this.totalSteps()) {
            return;
        }

        if (step < 1) {
            return;
        }

        if (
            this.totalStepperItems().length &&
            !!this.totalStepperItemsArray()[step] &&
            this.totalStepperItemsArray()[step].hasAttribute('disabled')
        ) {
            return;
        }

        if (this.linear()) {
            const currentValue = this.value() ?? 1;
            if (step > currentValue + 1) {
                return;
            }
        }
        this.value.set(step);
    }
}
