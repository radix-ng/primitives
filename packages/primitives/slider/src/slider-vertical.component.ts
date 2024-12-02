import { Component, computed, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { RdxSliderImplDirective } from './slider-impl.directive';
import { BACK_KEYS, linearScale } from './utils';

@Component({
    selector: 'rdx-slider-vertical',
    standalone: true,
    imports: [RdxSliderImplDirective],
    template: `
        <span
            [attr.data-orientation]="'vertical'"
            [style]="{ '--rdx-slider-thumb-transform': 'translateX(-50%)' }"
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
    @Input() inverted = false;
    @Input() min = 0;
    @Input() max = 100;

    @Output() slideStart = new EventEmitter<number>();
    @Output() slideMove = new EventEmitter<number>();
    @Output() slideEnd = new EventEmitter<void>();
    @Output() stepKeyDown = new EventEmitter<{ event: KeyboardEvent; direction: number }>();
    @Output() endKeyDown = new EventEmitter<KeyboardEvent>();
    @Output() homeKeyDown = new EventEmitter<KeyboardEvent>();

    private rect = signal<DOMRect | undefined>(undefined);

    private isSlidingFromBottom = computed(() => !this.inverted);

    @ViewChild(RdxSliderImplDirective, { static: true }) sliderImpl!: RdxSliderImplDirective;

    onSlideStart(event: PointerEvent) {
        const value = this.getValueFromPointer(event.clientX);
        this.slideStart.emit(value);
    }

    onSlideMove(event: PointerEvent) {
        const value = this.getValueFromPointer(event.clientX);
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
        const rect = this.rect() || document.body.getBoundingClientRect();
        const input: [number, number] = [0, rect.width];
        const output: [number, number] = this.isSlidingFromBottom() ? [this.min, this.max] : [this.max, this.min];

        const scale = linearScale(input, output);
        this.rect.set(rect);
        return scale(pointerPosition - rect.left);
    }
}
