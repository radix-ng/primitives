import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    Component,
    computed,
    inject,
    input,
    Input,
    model,
    numberAttribute,
    OnInit,
    output
} from '@angular/core';
import { RdxSliderHorizontalComponent } from './slider-horizontal.component';
import { RdxSliderOrientationContextService } from './slider-orientation-context.service';
import { RdxSliderVerticalComponent } from './slider-vertical.component';
import {
    clamp,
    getClosestValueIndex,
    getDecimalCount,
    getNextSortedValues,
    hasMinStepsBetweenValues,
    roundValue
} from './utils';

/**
 * @group Components
 */
@Component({
    selector: 'rdx-slider',
    imports: [RdxSliderHorizontalComponent, RdxSliderVerticalComponent, NgIf, NgTemplateOutlet],
    providers: [RdxSliderOrientationContextService],
    template: `
        <ng-template #transclude><ng-content /></ng-template>

        <ng-container *ngIf="orientation() === 'horizontal'">
            <rdx-slider-horizontal
                [className]="styleClass() || className"
                [min]="min()"
                [max]="max()"
                [dir]="dir()"
                [inverted]="inverted()"
                [attr.aria-disabled]="disabled()"
                [attr.data-disabled]="disabled() ? '' : undefined"
                (pointerdown)="onPointerDown()"
                (slideStart)="handleSlideStart($event)"
                (slideMove)="handleSlideMove($event)"
                (slideEnd)="handleSlideEnd()"
                (homeKeyDown)="updateValues(min(), 0, true)"
                (endKeyDown)="updateValues(max(), modelValue().length - 1, true)"
                (stepKeyDown)="handleStepKeyDown($event)"
            >
                <ng-container *ngTemplateOutlet="transclude" />
            </rdx-slider-horizontal>
        </ng-container>

        <ng-container *ngIf="orientation() === 'vertical'">
            <rdx-slider-vertical
                [className]="styleClass() || className"
                [min]="min()"
                [max]="max()"
                [dir]="dir()"
                [inverted]="inverted()"
                [attr.aria-disabled]="disabled()"
                [attr.data-disabled]="disabled() ? '' : undefined"
                (pointerdown)="onPointerDown()"
                (slideStart)="handleSlideStart($event)"
                (slideMove)="handleSlideMove($event)"
                (slideEnd)="handleSlideEnd()"
                (homeKeyDown)="updateValues(min(), 0, true)"
                (endKeyDown)="updateValues(max(), modelValue().length - 1, true)"
                (stepKeyDown)="handleStepKeyDown($event)"
            >
                <ng-container *ngTemplateOutlet="transclude" />
            </rdx-slider-vertical>
        </ng-container>
    `
})
export class RdxSliderRootComponent implements OnInit {
    /** @ignore */
    readonly orientationContext = inject(RdxSliderOrientationContextService);

    /**
     * The minimum value for the range.
     *
     * @group Props
     * @defaultValue 0
     */
    readonly min = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The maximum value for the range.
     *
     * @group Props
     * @defaultValue 100
     */
    readonly max = input<number, NumberInput>(100, { transform: numberAttribute });

    /**
     * The stepping interval.
     *
     * @group Props
     * @defaultValue 1
     */
    readonly step = input<number, NumberInput>(1, { transform: numberAttribute });

    /**
     * The minimum permitted steps between multiple thumbs.
     *
     * @group Props
     * @defaultValue 0
     */
    readonly minStepsBetweenThumbs = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The orientation of the slider.
     *
     * @group Props
     * @defaultValue 'horizontal'
     */
    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

    /**
     * When true, prevents the user from interacting with the slider.
     *
     * @group Props
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the slider is visually inverted.
     *
     * @group Props
     * @defaultValue false
     */
    readonly inverted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The reading direction of the combobox when applicable.
     *
     * @group Props
     * @defaultValue 'ltr'
     */
    readonly dir = input<'ltr' | 'rtl'>('ltr');

    @Input() className: string = '';

    /**
     * Style class of the component.
     *
     * @group Props
     */
    readonly styleClass = input<string>();

    /**
     * The controlled value of the slider.
     *
     * @group Props
     */
    readonly modelValue = model<number[]>([0]);

    /**
     * Event handler called when the slider value changes.
     *
     * @group Emits
     */
    readonly valueChange = output<number[]>();

    /**
     * Event handler called when the value changes at the end of an interaction.
     *
     * Useful when you only need to capture a final value e.g. to update a backend service.
     *
     * @group Emits
     */
    readonly valueCommit = output<number[]>();

    /** @ignore */
    readonly valueIndexToChange = model(0);

    /** @ignore */
    readonly valuesBeforeSlideStart = model<number[]>([]);

    /** @ignore */
    readonly isSlidingFromLeft = computed(
        () => (this.dir() === 'ltr' && !this.inverted()) || (this.dir() !== 'ltr' && this.inverted())
    );

    /** @ignore */
    readonly isSlidingFromBottom = computed(() => !this.inverted());

    /** @ignore */
    thumbElements: HTMLElement[] = [];

    /** @ignore */
    ngOnInit() {
        const isHorizontal = this.orientation() === 'horizontal';

        if (isHorizontal) {
            this.orientationContext.updateContext({
                direction: this.isSlidingFromLeft() ? 1 : -1,
                size: 'width',
                startEdge: this.isSlidingFromLeft() ? 'left' : 'right',
                endEdge: this.isSlidingFromLeft() ? 'right' : 'left'
            });
        } else {
            this.orientationContext.updateContext({
                direction: this.isSlidingFromBottom() ? -1 : 1,
                size: 'height',
                startEdge: this.isSlidingFromBottom() ? 'bottom' : 'top',
                endEdge: this.isSlidingFromBottom() ? 'top' : 'bottom'
            });
        }
    }

    /** @ignore */
    onPointerDown() {
        this.valuesBeforeSlideStart.set([...this.modelValue()]);
    }

    /** @ignore */
    handleSlideStart(value: number): void {
        const closestIndex = getClosestValueIndex(this.modelValue(), value);
        this.updateValues(value, closestIndex);
    }

    /** @ignore */
    handleSlideMove(value: number): void {
        this.updateValues(value, this.valueIndexToChange());
    }

    /** @ignore */
    handleSlideEnd(): void {
        const prevValue = this.valuesBeforeSlideStart()[this.valueIndexToChange()];
        const nextValue = this.modelValue()[this.valueIndexToChange()];
        const hasChanged = nextValue !== prevValue;

        if (hasChanged) {
            this.valueCommit.emit([...this.modelValue()]);
        }
    }

    /** @ignore */
    handleStepKeyDown(event: { event: KeyboardEvent; direction: number }): void {
        const stepInDirection = this.step() * event.direction;
        const atIndex = this.valueIndexToChange();
        const currentValue = this.modelValue()[atIndex];
        this.updateValues(currentValue + stepInDirection, atIndex, true);
    }

    /** @ignore */
    updateValues(value: number, atIndex: number, commit = false): void {
        const decimalCount = getDecimalCount(this.step());
        const snapToStep = roundValue(
            Math.round((value - this.min()) / this.step()) * this.step() + this.min(),
            decimalCount
        );
        const nextValue = clamp(snapToStep, this.min(), this.max());

        const nextValues = getNextSortedValues(this.modelValue(), nextValue, atIndex);

        if (hasMinStepsBetweenValues(nextValues, this.minStepsBetweenThumbs() * this.step())) {
            this.valueIndexToChange.set(nextValues.indexOf(nextValue));
            const hasChanged = String(nextValues) !== String(this.modelValue());

            if (hasChanged) {
                this.modelValue.set(nextValues);
                this.valueChange.emit([...this.modelValue()]);
                this.thumbElements[this.valueIndexToChange()]?.focus();

                if (commit) {
                    this.valueCommit.emit([...this.modelValue()]);
                }
            }
        }
    }
}
