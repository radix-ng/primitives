import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    Component,
    computed,
    EventEmitter,
    inject,
    input,
    Input,
    model,
    numberAttribute,
    OnInit,
    Output
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

@Component({
    selector: 'rdx-slider',
    standalone: true,
    imports: [RdxSliderHorizontalComponent, RdxSliderVerticalComponent, NgIf, NgTemplateOutlet],
    providers: [RdxSliderOrientationContextService],
    template: `
        <ng-template #transclude><ng-content /></ng-template>

        <ng-container *ngIf="orientation() === 'horizontal'">
            <rdx-slider-horizontal
                [className]="className"
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
                [className]="className"
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

    readonly min = input<number, NumberInput>(0, { transform: numberAttribute });

    readonly max = input<number, NumberInput>(100, { transform: numberAttribute });

    readonly step = input<number, NumberInput>(1, { transform: numberAttribute });

    readonly minStepsBetweenThumbs = input<number, NumberInput>(0, { transform: numberAttribute });

    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly inverted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly dir = input<'ltr' | 'rtl'>('ltr');

    @Input() className: string = '';

    @Output() valueChange = new EventEmitter<number[]>();
    @Output() valueCommit = new EventEmitter<number[]>();

    readonly modelValue = model<number[]>([0]);

    /** @ignore */
    readonly valueIndexToChange = model(0);

    /** @ignore */
    readonly valuesBeforeSlideStart = model<number[]>([]);

    readonly isSlidingFromLeft = computed(
        () => (this.dir() === 'ltr' && !this.inverted()) || (this.dir() !== 'ltr' && this.inverted())
    );

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
