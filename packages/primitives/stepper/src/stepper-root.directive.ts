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
import { STEPPER_ROOT_CONTEXT, StepperRootContext } from './stepper-root-context.token';

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
export class RdxStepperRootDirective implements StepperRootContext {
    readonly defaultValue = input<number, NumberInput>(undefined, { transform: numberAttribute });

    readonly value = model<number | undefined>(this.defaultValue());

    readonly linear = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    readonly dir = input<Direction>('ltr');

    readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

    /** @ignore */
    readonly totalStepperItemsArray = computed(() => Array.from(this.totalStepperItems()));

    /** @ignore */
    readonly isFirstStep = computed(() => this.value() === 1);

    /** @ignore */
    readonly isLastStep = computed(() => this.value() === this.totalStepperItemsArray().length);

    /** @ignore */
    readonly totalSteps = computed(() => this.totalStepperItems().length);

    /** @ignore */
    readonly isNextDisabled = computed<boolean>(() => {
        const item = this.nextStepperItem();
        return item ? item.hasAttribute('disabled') : true;
    });

    /** @ignore */
    readonly isPrevDisabled = computed<boolean>(() => {
        const item = this.prevStepperItem();
        return item ? item.hasAttribute('disabled') : true;
    });

    /** @ignore */
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
