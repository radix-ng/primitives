import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { injectSliderRootContext } from './slider-context';
import type { SliderValue } from './slider-root';
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
    private currentInteraction: { value: SliderValue; reason: 'track-press' | 'drag'; ownerValues: number[] } | null =
        null;
    private pointerId: number | null = null;
    private awaitingTouchStart = false;
    private touchId: number | null = null;
    private insetThumbOffset = 0;
    private pressedThumbIndex = -1;
    private pressedThumbCenterOffset: number | null = null;
    private pressedValues: number[] | null = null;

    private readonly onTouchStart = (event: TouchEvent) => this.handleTouchStart(event);
    private readonly onMove = (event: PointerEvent) => this.handleMove(event);
    private readonly onUp = (event: PointerEvent) => this.handleUp(event);
    private readonly onCancel = (event: PointerEvent) => {
        if (event.pointerId !== this.pointerId) return;
        if (this.touchId === null) {
            this.handleUp(event);
        } else {
            this.pointerId = null;
        }
    };
    private readonly onTouchMove = (event: TouchEvent) => {
        if (this.pointerId === null) this.handleMove(event);
    };
    private readonly onTouchEnd = (event: TouchEvent) => this.handleUp(event);

    constructor() {
        const control = this.elementRef.nativeElement;
        this.root.controlRef.set(control);
        control.style.setProperty('touch-action', 'none');
        control.addEventListener('touchstart', this.onTouchStart, { passive: true });
        watch(
            [
                () => this.root.isDisabled(),
                () => this.root.thumbList().map((thumb) => thumb.disabled()),
                () => this.root.values().length
            ],
            ([disabled, thumbs, count]) => {
                const index = this.pressedThumbIndex;
                if (index >= 0 && (disabled || index >= count || thumbs[index] !== false)) {
                    this.finishInteraction();
                }
            }
        );
        inject(DestroyRef).onDestroy(() => {
            control.removeEventListener('touchstart', this.onTouchStart);
            this.finishInteraction();
        });
    }

    protected onPointerDown(event: PointerEvent): void {
        const control = this.elementRef.nativeElement;
        if (this.pointerId !== null || this.touchId !== null) return;
        if (this.root.isDisabled() || event.defaultPrevented || event.button !== 0) {
            return;
        }
        const target = event.target as HTMLElement | null;
        if (!target) {
            return;
        }
        const thumbIndex = this.getTargetThumbIndex(target);
        if (this.root.thumbList()[thumbIndex]?.disabled()) return;

        // Suppress the nested range input's native click-to-set and drag so the
        // control fully owns pointer interaction (otherwise releasing on a thumb
        // fires a native change that snaps the value to the press point inside
        // the thumb-sized input). Focus is restored manually via focusThumb.
        event.preventDefault();

        this.styles = this.document.defaultView?.getComputedStyle(control) ?? null;
        this.startPressing({ x: event.clientX, y: event.clientY }, thumbIndex);
        const finger = this.getFingerState({ x: event.clientX, y: event.clientY });
        if (finger == null) {
            this.finishInteraction();
            return;
        }

        this.pointerId = event.pointerId;
        this.awaitingTouchStart = event.pointerType === 'touch' || event.pointerType === 'pen';
        this.root.setDragging(true);

        // Pressing directly on a thumb sets a center offset; only a rail press changes value on down.
        if (this.pressedThumbCenterOffset === null) {
            this.setValueFromPointer(finger, 'track-press', event);
        }

        this.root.focusThumb(finger.thumbIndex);

        if (event.isTrusted && event.pointerId) control.setPointerCapture(event.pointerId);
        this.moveCount = 0;
        this.document.addEventListener('pointermove', this.onMove);
        this.document.addEventListener('pointerup', this.onUp);
        this.document.addEventListener('pointercancel', this.onCancel);
    }

    private handleTouchStart(event: TouchEvent): void {
        if (this.root.isDisabled() || event.defaultPrevented || this.touchId !== null) {
            return;
        }

        const startedByPointer = this.awaitingTouchStart;
        this.awaitingTouchStart = false;
        if (!startedByPointer && this.pointerId !== null) return;
        const touch = event.changedTouches[0];
        if (!touch) {
            return;
        }
        const thumbIndex = this.getTargetThumbIndex(event.target);
        if (this.root.thumbList()[thumbIndex]?.disabled()) return;

        this.touchId = touch.identifier;
        if (!startedByPointer) {
            const coords = { x: touch.clientX, y: touch.clientY };
            this.styles = this.document.defaultView?.getComputedStyle(this.elementRef.nativeElement) ?? null;
            this.startPressing(coords, thumbIndex);
            const finger = this.getFingerState(coords);
            if (finger === null) {
                this.finishInteraction();
                return;
            }
            this.root.focusThumb(finger.thumbIndex);
            if (this.pressedThumbCenterOffset === null) {
                this.setValueFromPointer(finger, 'track-press', event);
            }
            this.moveCount = 0;
        }

        this.document.addEventListener('touchmove', this.onTouchMove, { passive: true });
        this.document.addEventListener('touchend', this.onTouchEnd, { passive: true });
        this.document.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
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
        if (this.getFingerCoords(event) === null) return;
        this.finishInteraction(event);
    }

    private finishInteraction(event?: Event): void {
        const interaction = this.currentInteraction;
        const pointerId = this.pointerId;
        this.pointerId = null;
        this.touchId = null;
        this.awaitingTouchStart = false;
        this.currentInteraction = null;
        this.stopListening();
        this.root.setActive(-1);
        this.root.setDragging(false);
        this.pressedThumbIndex = -1;
        this.pressedThumbCenterOffset = null;
        this.pressedValues = null;

        const control = this.elementRef.nativeElement;
        if (pointerId !== null && control.hasPointerCapture?.(pointerId)) {
            control.releasePointerCapture(pointerId);
        }

        if (event && interaction && !this.root.isDisabled()) {
            const values = this.root.values();
            const value = interaction.value;
            if (Array.isArray(value) ? this.root.range() && value.length === values.length : !this.root.range()) {
                this.root.commitValue(value, event, interaction.reason);
            }
        }
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

        return this.pointerId === event.pointerId ? { x: event.clientX, y: event.clientY } : null;
    }

    private getTargetThumbIndex(target: EventTarget | null): number {
        const NodeCtor = this.elementRef.nativeElement.ownerDocument.defaultView?.Node;
        if (!NodeCtor || !(target instanceof NodeCtor)) {
            return -1;
        }
        return this.root.thumbList().findIndex((thumb) => thumb.element.contains(target));
    }

    private startPressing(finger: PointerCoords, pressedThumbIndex: number): void {
        const values = this.root.values();
        const range = this.root.range();
        this.pressedValues = range ? values.slice() : null;

        let closestThumbIndex = pressedThumbIndex;
        const axis = this.root.orientation() === 'horizontal' ? 'x' : 'y';
        const thumbs = this.root.thumbList();

        if (pressedThumbIndex > -1 && pressedThumbIndex < values.length) {
            const thumb = thumbs[pressedThumbIndex];
            this.pressedThumbCenterOffset = finger[axis] - getMidpoint(thumb.element)[axis];
            // Pressed directly on a thumb sitting on max — walk left over stacked max thumbs.
            if (values[pressedThumbIndex] === this.root.max()) {
                let c = pressedThumbIndex;
                while (c > 0 && values[c - 1] === this.root.max() && !thumbs[c - 1]?.disabled()) {
                    c -= 1;
                }
                closestThumbIndex = c;
            }
        } else {
            // Pressed on the rail — find the nearest enabled thumb by midpoint distance.
            let minDistance: number | undefined;
            closestThumbIndex = -1;
            for (let i = 0; i < Math.min(thumbs.length, values.length); i += 1) {
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

        this.pressedThumbIndex = closestThumbIndex;
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
        const ownerValues = this.root.values();
        const nextValues = Array.isArray(finger.value) ? finger.value : [finger.value];
        const applied = this.root.setValue(nextValues, reason, event, finger.thumbIndex);
        if (applied) {
            this.currentInteraction = { value: finger.value, reason, ownerValues };
            if (finger.didSwap) {
                this.pressedThumbIndex = finger.thumbIndex;
            }
        }
        return applied;
    }

    /** Projects a pointer position onto the track and resolves it to a value (+ collision). */
    private getFingerState(finger: { x: number; y: number }): ResolveThumbCollisionResult | null {
        const control = this.root.controlRef();
        const values = this.root.values();
        const range = this.root.range();
        const thumbIndex = this.pressedThumbIndex;
        const vertical = this.root.orientation() === 'vertical';
        const rtl = this.root.dir() === 'rtl';
        const min = this.root.min();
        const max = this.root.max();
        const step = this.root.step();

        if (
            !control ||
            thumbIndex < 0 ||
            thumbIndex >= values.length ||
            this.root.thumbList()[thumbIndex]?.disabled()
        ) {
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

        const thumbCenterOffset = this.pressedThumbCenterOffset ?? 0;
        const fingerX = finger.x - thumbCenterOffset;
        const fingerY = finger.y - thumbCenterOffset;

        const valueSize = vertical
            ? bottom - fingerY - controlOffset.end
            : (rtl ? right - fingerX : fingerX - left) - controlOffset.start;

        const valueRescaled = clamp((valueSize - this.insetThumbOffset) / controlSize, 0, 1);

        let newValue = (max - min) * valueRescaled + min;
        newValue = roundValueToStep(newValue, step, min);
        newValue = clamp(newValue, min, max);

        if (values.length === 1) {
            return { value: range ? [newValue] : newValue, thumbIndex, didSwap: false };
        }
        const interaction = this.currentInteraction;
        const currentValues =
            interaction?.ownerValues === values && Array.isArray(interaction.value) ? interaction.value : values;
        return resolveThumbCollision({
            behavior: this.root.thumbCollisionBehavior(),
            values,
            currentValues,
            initialValues: this.pressedValues,
            pressedIndex: thumbIndex,
            nextValue: newValue,
            min,
            max,
            step,
            minStepsBetweenValues: this.root.minStepsBetweenValues()
        });
    }
}
