import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { injectSliderRootContext } from './slider-context';
import {
    clamp,
    getControlOffset,
    getMidpoint,
    resolveThumbCollision,
    ResolveThumbCollisionResult,
    roundValueToStep,
    validateMinimumDistance
} from './slider.utils';

const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2;

/**
 * The interactive area of the slider. Handles pointer presses and drags on the
 * track, mapping pointer position to a value and moving the closest thumb.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'div[rdxSliderControl]',
    exportAs: 'rdxSliderControl',
    host: {
        '[attr.data-orientation]': 'root.orientation()',
        '[attr.data-disabled]': 'root.isDisabled() ? "" : undefined',
        '[attr.data-dragging]': 'root.dragging() ? "" : undefined',
        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class RdxSliderControl {
    protected readonly root = injectSliderRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = inject(DOCUMENT);

    private styles: CSSStyleDeclaration | null = null;
    private moveCount = 0;
    private currentInteractionValue: number | number[] | null = null;

    private readonly onMove = (event: PointerEvent) => this.handleMove(event);
    private readonly onUp = (event: PointerEvent) => this.handleUp(event);
    private readonly onCancel = (event: PointerEvent) => this.handleUp(event);

    constructor() {
        this.root.controlRef.set(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(() => this.stopListening());
    }

    protected onPointerDown(event: PointerEvent): void {
        const control = this.elementRef.nativeElement;
        if (this.root.isDisabled() || event.defaultPrevented || event.button !== 0) {
            return;
        }
        const target = event.target as HTMLElement | null;
        if (!target) {
            return;
        }

        // Suppress the nested range input's native click-to-set and drag so the
        // control fully owns pointer interaction (otherwise releasing on a thumb
        // fires a native change that snaps the value to the press point inside
        // the thumb-sized input). Focus is restored manually via focusThumb.
        event.preventDefault();

        this.styles = this.document.defaultView?.getComputedStyle(control) ?? null;
        this.startPressing({ x: event.clientX, y: event.clientY });
        const finger = this.getFingerState({ x: event.clientX, y: event.clientY });
        if (finger == null) {
            return;
        }

        this.root.setDragging(true);

        // Pressing directly on a thumb sets a center offset; only a rail press changes value on down.
        if (this.root.pressedThumbCenterOffset == null) {
            this.setValueFromPointer(finger, 'track-press');
        }

        this.root.focusThumb(finger.thumbIndex);

        control.setPointerCapture(event.pointerId);
        this.moveCount = 0;
        this.document.addEventListener('pointermove', this.onMove);
        this.document.addEventListener('pointerup', this.onUp, { once: true });
        this.document.addEventListener('pointercancel', this.onCancel, { once: true });
    }

    private handleMove(event: PointerEvent): void {
        this.moveCount += 1;
        if (event.buttons === 0) {
            this.handleUp(event);
            return;
        }
        const finger = this.getFingerState({ x: event.clientX, y: event.clientY });
        if (finger == null) {
            return;
        }
        if (validateMinimumDistance(finger.value, this.root.step(), this.root.minStepsBetweenValues())) {
            if (!this.root.dragging() && this.moveCount > INTENTIONAL_DRAG_COUNT_THRESHOLD) {
                this.root.setDragging(true);
            }
            const applied = this.setValueFromPointer(finger, 'drag');
            if (applied && finger.didSwap) {
                this.root.focusThumb(finger.thumbIndex);
            }
        }
    }

    private handleUp(event: PointerEvent): void {
        this.root.setActive(-1);
        this.root.setDragging(false);
        this.root.pressedThumbCenterOffset = null;
        this.root.pressedInput = null;

        if (this.currentInteractionValue != null) {
            this.root.commitValue();
        }

        const control = this.elementRef.nativeElement;
        if (control.hasPointerCapture?.(event.pointerId)) {
            control.releasePointerCapture(event.pointerId);
        }

        this.root.resetPressedThumb();
        this.root.pressedValues = null;
        this.currentInteractionValue = null;
        this.stopListening();
    }

    private stopListening(): void {
        this.document.removeEventListener('pointermove', this.onMove);
        this.document.removeEventListener('pointerup', this.onUp);
        this.document.removeEventListener('pointercancel', this.onCancel);
    }

    private startPressing(finger: { x: number; y: number }): void {
        const values = this.root.values();
        const range = this.root.range();
        this.root.pressedValues = range ? values.slice() : null;
        this.currentInteractionValue = null;

        const pressedThumbIndex = this.root.pressedThumbIndex;
        let closestThumbIndex = pressedThumbIndex;

        if (pressedThumbIndex > -1 && pressedThumbIndex < values.length) {
            // Pressed directly on a thumb sitting on max — walk left over stacked max thumbs.
            if (values[pressedThumbIndex] === this.root.max()) {
                let c = pressedThumbIndex;
                while (c > 0 && values[c - 1] === this.root.max()) {
                    c -= 1;
                }
                closestThumbIndex = c;
            }
        } else {
            // Pressed on the rail — find the nearest enabled thumb by midpoint distance.
            const axis = this.root.orientation() === 'horizontal' ? 'x' : 'y';
            const thumbs = this.root.thumbList();
            let minDistance: number | undefined;
            closestThumbIndex = -1;
            for (let i = 0; i < thumbs.length; i += 1) {
                const thumb = thumbs[i];
                if (thumb.disabled()) {
                    continue;
                }
                const midpoint = getMidpoint(thumb.element);
                const distance = Math.abs(finger[axis] - midpoint[axis]);
                if (minDistance === undefined || distance <= minDistance) {
                    closestThumbIndex = i;
                    minDistance = distance;
                }
            }
        }

        if (closestThumbIndex > -1 && closestThumbIndex !== pressedThumbIndex) {
            this.root.pressedThumbIndex = closestThumbIndex;
            this.root.pressedInput = this.root.thumbList()[closestThumbIndex]?.inputElement ?? null;
        }
    }

    private setValueFromPointer(finger: ResolveThumbCollisionResult, reason: string): boolean {
        const nextValues = Array.isArray(finger.value) ? finger.value : [finger.value];
        const applied = this.root.setValue(nextValues, reason);
        if (applied) {
            this.currentInteractionValue = finger.value;
            if (finger.didSwap) {
                this.root.pressedThumbIndex = finger.thumbIndex;
                this.root.pressedInput = this.root.thumbList()[finger.thumbIndex]?.inputElement ?? null;
            }
        }
        return applied;
    }

    /** Projects a pointer position onto the track and resolves it to a value (+ collision). */
    private getFingerState(finger: { x: number; y: number }): ResolveThumbCollisionResult | null {
        const control = this.root.controlRef();
        const values = this.root.values();
        const range = this.root.range();
        const thumbIndex = this.root.pressedThumbIndex;
        const vertical = this.root.orientation() === 'vertical';
        const rtl = this.root.dir() === 'rtl';
        const min = this.root.min();
        const max = this.root.max();
        const step = this.root.step();

        if (!control || (!range && (thumbIndex < 0 || thumbIndex >= values.length))) {
            return null;
        }

        const { width, height, bottom, left, right } = control.getBoundingClientRect();
        const controlOffset = getControlOffset(this.styles, vertical, rtl);
        const controlSize = (vertical ? height : width) - controlOffset.start - controlOffset.end;

        // A collapsed/unmeasurable track would divide by zero and yield NaN values.
        if (!(controlSize > 0)) {
            return null;
        }

        const thumbCenterOffset = this.root.pressedThumbCenterOffset ?? 0;
        const fingerX = finger.x - thumbCenterOffset;
        const fingerY = finger.y - thumbCenterOffset;

        const valueSize = vertical
            ? bottom - fingerY - controlOffset.end
            : (rtl ? right - fingerX : fingerX - left) - controlOffset.start;

        const valueRescaled = clamp(valueSize / controlSize, 0, 1);

        let newValue = (max - min) * valueRescaled + min;
        newValue = roundValueToStep(newValue, step, min);
        newValue = clamp(newValue, min, max);

        if (!range) {
            return { value: newValue, thumbIndex, didSwap: false };
        }
        if (thumbIndex < 0) {
            return null;
        }

        return resolveThumbCollision({
            behavior: this.root.thumbCollisionBehavior(),
            values,
            currentValues: values,
            initialValues: this.root.pressedValues,
            pressedIndex: thumbIndex,
            nextValue: newValue,
            min,
            max,
            step,
            minStepsBetweenValues: this.root.minStepsBetweenValues()
        });
    }
}
