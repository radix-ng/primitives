import {
    clamp,
    getControlOffset,
    getMidpoint,
    resolveThumbCollision,
    ResolveThumbCollisionResult,
    roundValueToStep,
    validateMinimumDistance
} from './slider.utils';
import { injectSliderRootContext } from './slider-context';
import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2;

type PointerCoords = { x: number; y: number };

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
    private touchId: number | null = null;
    private insetThumbOffset = 0;

    private readonly onTouchStart = (event: TouchEvent) => this.handleTouchStart(event);
    private readonly onMove = (event: PointerEvent) => this.handleMove(event);
    private readonly onUp = (event: PointerEvent) => this.handleUp(event);
    private readonly onCancel = (event: PointerEvent) => this.handleUp(event);
    private readonly onTouchMove = (event: TouchEvent) => this.handleMove(event);
    private readonly onTouchEnd = (event: TouchEvent) => this.handleUp(event);

    constructor() {
        const control = this.elementRef.nativeElement;
        this.root.controlRef.set(control);
        control.style.setProperty('touch-action', 'none');
        control.addEventListener('touchstart', this.onTouchStart, { passive: true });
        inject(DestroyRef).onDestroy(() => {
            control.removeEventListener('touchstart', this.onTouchStart);
            this.stopListening();
        });
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
        if (this.isTargetDisabledThumb(target)) {
            this.root.resetPressedThumb();
            return;
        }

        // Suppress the nested range input's native click-to-set and drag so the
        // control fully owns pointer interaction (otherwise releasing on a thumb
        // fires a native change that snaps the value to the press point inside
        // the thumb-sized input). Focus is restored manually via focusThumb.
        event.preventDefault();

        this.touchId = null;
        this.styles = this.document.defaultView?.getComputedStyle(control) ?? null;
        this.startPressing({ x: event.clientX, y: event.clientY });
        const finger = this.getFingerState({ x: event.clientX, y: event.clientY });
        if (finger == null) {
            return;
        }

        this.root.setDragging(true);

        // Pressing directly on a thumb sets a center offset; only a rail press changes value on down.
        if (this.root.pressedThumbCenterOffset == null) {
            this.setValueFromPointer(finger, 'track-press', event);
        }

        this.root.focusThumb(finger.thumbIndex);

        control.setPointerCapture(event.pointerId);
        this.moveCount = 0;
        this.document.addEventListener('pointermove', this.onMove);
        this.document.addEventListener('pointerup', this.onUp, { once: true });
        this.document.addEventListener('pointercancel', this.onCancel, { once: true });
    }

    private handleTouchStart(event: TouchEvent): void {
        if (this.root.isDisabled()) {
            return;
        }

        const touch = event.changedTouches[0];
        if (!touch) {
            return;
        }
        if (this.isTargetDisabledThumb(event.target)) {
            this.root.resetPressedThumb();
            return;
        }

        this.touchId = touch.identifier;
        this.styles = this.document.defaultView?.getComputedStyle(this.elementRef.nativeElement) ?? null;

        const fingerCoords = this.getFingerCoords(event);
        if (fingerCoords == null) {
            return;
        }

        this.startPressing(fingerCoords);
        const finger = this.getFingerState(fingerCoords);
        if (finger == null) {
            return;
        }

        this.root.focusThumb(finger.thumbIndex);
        const applied = this.setValueFromPointer(finger, 'track-press', event);
        if (applied && finger.didSwap) {
            this.root.focusThumb(finger.thumbIndex);
        }

        this.moveCount = 0;
        this.document.addEventListener('touchmove', this.onTouchMove, { passive: true });
        this.document.addEventListener('touchend', this.onTouchEnd, { passive: true, once: true });
        this.document.addEventListener('touchcancel', this.onTouchEnd, { passive: true, once: true });
    }

    private handleMove(event: PointerEvent | TouchEvent): void {
        const fingerCoords = this.getFingerCoords(event);
        if (fingerCoords == null) {
            return;
        }

        this.moveCount += 1;
        if ('buttons' in event && event.buttons === 0) {
            this.handleUp(event);
            return;
        }

        const finger = this.getFingerState(fingerCoords);
        if (finger == null) {
            return;
        }
        if (validateMinimumDistance(finger.value, this.root.step(), this.root.minStepsBetweenValues())) {
            if (!this.root.dragging() && this.moveCount > INTENTIONAL_DRAG_COUNT_THRESHOLD) {
                this.root.setDragging(true);
            }
            const applied = this.setValueFromPointer(finger, 'drag', event);
            if (applied && finger.didSwap) {
                this.root.focusThumb(finger.thumbIndex);
            }
        }
    }

    private handleUp(event: PointerEvent | TouchEvent): void {
        this.root.setActive(-1);
        this.root.setDragging(false);
        this.root.pressedThumbCenterOffset = null;
        this.root.pressedInput = null;

        if (this.currentInteractionValue != null) {
            this.root.commitValue(event);
        }

        const control = this.elementRef.nativeElement;
        if ('pointerId' in event && control.hasPointerCapture?.(event.pointerId)) {
            control.releasePointerCapture(event.pointerId);
        }

        this.root.resetPressedThumb();
        this.touchId = null;
        this.root.pressedValues = null;
        this.currentInteractionValue = null;
        this.stopListening();
    }

    private stopListening(): void {
        this.document.removeEventListener('pointermove', this.onMove);
        this.document.removeEventListener('pointerup', this.onUp);
        this.document.removeEventListener('pointercancel', this.onCancel);
        this.document.removeEventListener('touchmove', this.onTouchMove);
        this.document.removeEventListener('touchend', this.onTouchEnd);
        this.document.removeEventListener('touchcancel', this.onTouchEnd);
    }

    private getFingerCoords(event: PointerEvent | TouchEvent): PointerCoords | null {
        if ('changedTouches' in event) {
            if (this.touchId == null) {
                return null;
            }

            for (let i = 0; i < event.changedTouches.length; i += 1) {
                const touch = event.changedTouches[i];
                if (touch.identifier === this.touchId) {
                    return { x: touch.clientX, y: touch.clientY };
                }
            }

            return null;
        }

        return { x: event.clientX, y: event.clientY };
    }

    private isTargetDisabledThumb(target: EventTarget | null): boolean {
        const NodeCtor = this.elementRef.nativeElement.ownerDocument.defaultView?.Node;
        if (!NodeCtor || !(target instanceof NodeCtor)) {
            return false;
        }

        return this.root.thumbList().some((thumb) => thumb.disabled() && thumb.element.contains(target));
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

        this.insetThumbOffset = 0;
        if (this.root.inset()) {
            const thumb = this.root.thumbList()[closestThumbIndex]?.element;
            if (thumb) {
                const rect = thumb.getBoundingClientRect();
                this.insetThumbOffset = (this.root.orientation() === 'vertical' ? rect.height : rect.width) / 2;
            }
        }
    }

    private setValueFromPointer(
        finger: ResolveThumbCollisionResult,
        reason: 'track-press' | 'drag',
        event?: Event
    ): boolean {
        const nextValues = Array.isArray(finger.value) ? finger.value : [finger.value];
        const applied = this.root.setValue(nextValues, reason, event, finger.thumbIndex);
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
        const controlSize =
            (vertical ? height : width) - controlOffset.start - controlOffset.end - this.insetThumbOffset * 2;

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

        const valueRescaled = clamp((valueSize - this.insetThumbOffset) / controlSize, 0, 1);

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
