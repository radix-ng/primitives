import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Component,
    computed,
    ElementRef,
    EventEmitter,
    input,
    Input,
    Output,
    signal,
    viewChild
} from '@angular/core';
import { RdxSliderImplDirective } from './slider-impl.directive';
import { BACK_KEYS, linearScale } from './utils';

@Component({
    selector: 'rdx-slider-vertical',
    standalone: true,
    imports: [RdxSliderImplDirective],
    template: `
        <span
            #sliderElement
            [class]="className"
            [attr.data-orientation]="'vertical'"
            [style]="{ '--rdx-slider-thumb-transform': 'translateY(-50%)' }"
            (slideStart)="onSlideStart($event)"
            (slideMove)="onSlideMove($event)"
            (slideEnd)="onSlideEnd()"
            (stepKeyDown)="onStepKeyDown($event)"
            (endKeyDown)="endKeyDown.emit($event)"
            (homeKeyDown)="homeKeyDown.emit($event)"
            rdxSliderImpl
        >
            <ng-content />
        </span>
    `
})
export class RdxSliderVerticalComponent {
    @Input() dir: 'ltr' | 'rtl' = 'ltr';

    readonly inverted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    @Input() min = 0;
    @Input() max = 100;

    @Input() className = '';

    @Output() slideStart = new EventEmitter<number>();
    @Output() slideMove = new EventEmitter<number>();
    @Output() slideEnd = new EventEmitter<void>();
    @Output() stepKeyDown = new EventEmitter<{ event: KeyboardEvent; direction: number }>();
    @Output() endKeyDown = new EventEmitter<KeyboardEvent>();
    @Output() homeKeyDown = new EventEmitter<KeyboardEvent>();

    private readonly sliderElement = viewChild<ElementRef>('sliderElement');

    private readonly rect = signal<DOMRect | undefined>(undefined);

    private readonly isSlidingFromBottom = computed(() => !this.inverted());

    onSlideStart(event: PointerEvent) {
        const value = this.getValueFromPointer(event.clientY);
        this.slideStart.emit(value);
    }

    onSlideMove(event: PointerEvent) {
        const value = this.getValueFromPointer(event.clientY);
        this.slideMove.emit(value);
    }

    onSlideEnd() {
        this.rect.set(undefined);
        this.slideEnd.emit();
    }

    onStepKeyDown(event: KeyboardEvent) {
        const slideDirection = this.isSlidingFromBottom() ? 'from-bottom' : 'from-top';
        const isBackKey = BACK_KEYS[slideDirection].includes(event.key);

        this.stepKeyDown.emit({ event, direction: isBackKey ? -1 : 1 });
    }

    private getValueFromPointer(pointerPosition: number): number {
        this.rect.set(this.sliderElement()?.nativeElement.getBoundingClientRect());
        const rect = this.rect();
        if (!rect) return 0;

        const input: [number, number] = [0, rect.height];
        const output: [number, number] = this.isSlidingFromBottom() ? [this.max, this.min] : [this.min, this.max];

        const value = linearScale(input, output);
        this.rect.set(rect);

        return value(pointerPosition - rect.top);
    }
}
