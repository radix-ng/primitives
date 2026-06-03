import { STEPPER_ROOT_CONTEXT, StepperRootContext } from './stepper-root-context.token';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    Direction,
    NumberInput,
    RdxCancelableChangeEventDetails,
    RdxLiveAnnouncer
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';

export type RdxStepperValueChangeReason = 'trigger-press' | 'keyboard' | 'none';
export type RdxStepperValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxStepperValueChangeReason>;

export interface RdxStepperValueChangeEvent {
    value: number;
    eventDetails: RdxStepperValueChangeEventDetails;
}

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
    private readonly liveAnnouncer = inject(RdxLiveAnnouncer);

    readonly defaultValue = input<number, NumberInput>(undefined, { transform: numberAttribute });

    readonly value = model<number | undefined>(this.defaultValue());

    readonly linear = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

    readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

    /** @ignore */
    readonly totalStepperItemsArray = computed(() => Array.from(this.totalStepperItems()));

    readonly onValueChange = output<RdxStepperValueChangeEvent>();

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

                this.liveAnnouncer.announce(`Step ${currentValue} of ${items.length}`);
            }
        });
    }

    goToStep(step: number, event?: Event, reason: RdxStepperValueChangeReason = event ? 'trigger-press' : 'none') {
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

        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            reason,
            event ?? new Event('stepper.value-change'),
            trigger
        );
        this.onValueChange.emit({ value: step, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.value.set(step);
    }
}
