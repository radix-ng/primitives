// Based on https://github.com/origin-space/image-cropper/blob/main/src/Cropper.tsx

import { CropperRootContext, provideCropperRootContext } from './cropper-context.token';
import {
    Area,
    calculateCropData as computeCropData,
    CropperGeometry,
    restrictOffset as computeRestrictedOffset
} from './cropper-math';
import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked
} from '@angular/core';
import { BooleanInput, clamp, injectId, NumberInput, resizeEffect } from '@radix-ng/primitives/core';

export type { Area };

/** Value equality for an `Area` so the crop `computed` only notifies when the rectangle changes. */
const areaEqual = (a: Area | null, b: Area | null): boolean =>
    a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

/** Value equality for an `{x,y}` point so the clamped-offset `computed` only notifies on real moves. */
const pointEqual = (a: { x: number; y: number }, b: { x: number; y: number }): boolean => a.x === b.x && a.y === b.y;

/** Exposes the root's public state to the child parts (image, crop-area, description). */
const rootContext = (): CropperRootContext => {
    const instance = inject(RdxCropperRootDirective);
    return {
        image: instance.image,
        imageWrapperStyle: instance.imageWrapperStyle,
        cropAreaStyle: instance.cropAreaStyle,
        descriptionId: instance.descriptionId
    };
};

@Directive({
    selector: '[rdxCropperRoot]',
    providers: [provideCropperRootContext(rootContext)],
    host: {
        // `application` so a screen reader passes arrow/+/- keys straight to our handlers (pan + zoom)
        // instead of intercepting them for browse-mode navigation; instructions come via the
        // description element referenced by `aria-describedby`. The slider-style `aria-value*`
        // attributes were removed — they are only honored on range roles, so they were dead here.
        role: 'application',
        '[attr.tabindex]': 'disabled() ? -1 : 0',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-describedby]': 'descriptionId',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-dragging]': 'isDragging() ? "" : undefined'
    }
})
export class RdxCropperRootDirective {
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly injector = inject(Injector);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly CROPPER_DESC_WARN_MESSAGE = `Warning: \`Cropper\` requires a description element for accessibility.`;

    readonly image = input.required<string>();
    readonly cropPadding = input(25, { transform: numberAttribute });
    readonly aspectRatio = input(1, { transform: numberAttribute });
    readonly minZoom = input(1, { transform: numberAttribute });
    readonly maxZoom = input(3, { transform: numberAttribute });
    readonly zoomSensitivity = input(0.005, { transform: numberAttribute });
    /** Pan distance (px) per arrow-key press. */
    readonly keyboardStep = input(10, { transform: numberAttribute });
    /** Zoom delta per `+` / `-` / `PageUp` / `PageDown` press. */
    readonly zoomKeyboardStep = input(0.1, { transform: numberAttribute });
    readonly zoom = input<number, NumberInput>(undefined, { transform: numberAttribute });
    /** Accessible name for the cropper widget. */
    readonly ariaLabel = input('Interactive image cropper');
    /** Disables all interaction (drag, wheel/pinch zoom, keyboard); exposed as `data-disabled`. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly onCropChange = output<Area | null>();
    readonly onZoomChange = output<number>();

    // State signals
    private readonly imgWidth = signal<number | null>(null);
    private readonly imgHeight = signal<number | null>(null);
    /** Raw content-box size (px) of the root, fed by the ResizeObserver / initial measure. */
    private readonly containerSize = signal({ width: 0, height: 0 });
    /**
     * Crop-area size derived from the container minus padding, fitted to `aspectRatio`. A `computed`
     * (not a written signal) so it stays reactive to `aspectRatio` / `cropPadding` changes, not only
     * to container resizes — previously these inputs were read inside the ResizeObserver closure and
     * never recomputed until the next resize.
     */
    private readonly cropAreaSize = computed(() => {
        const { width, height } = this.containerSize();
        if (width <= 0 || height <= 0) {
            return { width: 0, height: 0 };
        }

        const maxPossibleWidth = Math.max(0, width - this.cropPadding() * 2);
        const maxPossibleHeight = Math.max(0, height - this.cropPadding() * 2);
        const aspectRatio = this.aspectRatio();

        if (maxPossibleWidth / aspectRatio >= maxPossibleHeight) {
            return { width: maxPossibleHeight * aspectRatio, height: maxPossibleHeight };
        }
        return { width: maxPossibleWidth, height: maxPossibleWidth / aspectRatio };
    });
    private readonly cropAreaWidth = computed(() => this.cropAreaSize().width);
    private readonly cropAreaHeight = computed(() => this.cropAreaSize().height);
    private readonly imageWrapperWidth = signal(0);
    private readonly imageWrapperHeight = signal(0);
    /** Raw (unclamped) pan-offset intent (px) written by gestures; clamping lives in `clampedOffset`. */
    private readonly offset = signal({ x: 0, y: 0 });
    private readonly internalZoom = signal(this.minZoom());
    protected readonly isDragging = signal(false);
    // SSR-stable, deterministic id (the project's CDK-free `_IdGenerator` replacement) so the
    // `aria-describedby` reference matches between server and client renders.
    readonly descriptionId = injectId('rdx-cropper-description-');

    private readonly isZoomControlled = computed(() => this.zoom() !== undefined);
    protected readonly effectiveZoom = computed(() => (this.isZoomControlled() ? this.zoom()! : this.internalZoom()));

    /**
     * The applied pan offset (px): the raw intent clamped to keep the image covering the crop window
     * at the current geometry/zoom. Derived (not an effect) so it self-corrects when the container
     * resizes or the zoom/aspect-ratio changes — no write-back, no `untracked` re-entrancy. This is the
     * value the view renders and the crop math reads.
     */
    private readonly clampedOffset = computed(
        () => this.restrictOffset(this.offset().x, this.offset().y, this.effectiveZoom()),
        { equal: pointEqual }
    );

    /**
     * Crop rectangle derived from the rendered pan/zoom — the single source of truth for emission.
     * `onCropChange` fires from one effect watching this, so interactions/handlers never emit directly
     * (which previously double-emitted). Value equality keeps it from notifying on equal results.
     */
    private readonly cropData = computed<Area | null>(
        () =>
            computeCropData(this.clampedOffset().x, this.clampedOffset().y, this.effectiveZoom(), this.geometry(), {
                width: this.imgWidth(),
                height: this.imgHeight()
            }),
        { equal: areaEqual }
    );

    // Refs
    private readonly dragStartPoint = signal({ x: 0, y: 0 });
    private readonly dragStartOffset = signal({ x: 0, y: 0 });
    private readonly latestZoom = signal(this.minZoom());
    private readonly initialPinchDistance = signal(0);
    private readonly initialPinchZoom = signal(1);
    private readonly isPinching = signal(false);
    private readonly hasWarned = signal(false);

    constructor() {
        afterNextRender(() => {
            this.initializeContainerDimensions();
        });

        this.setupImageLoadEffect();
        this.setupDimensionsEffects();
        this.setupAccessibilityWarningEffect();
        this.setupEventListenersEffect();

        effect(() => {
            this.latestZoom.set(this.effectiveZoom());
        });

        // Single source of crop emission: emit whenever the derived crop rectangle changes.
        effect(() => {
            const data = this.cropData();
            untracked(() => this.onCropChange.emit(data));
        });
    }

    private updateZoom(newZoomValue: number): number {
        const clampedZoom = clamp(newZoomValue, this.minZoom(), this.maxZoom());

        this.onZoomChange.emit(clampedZoom);

        if (!this.isZoomControlled()) {
            this.internalZoom.set(clampedZoom);
        }
        return clampedZoom;
    }

    private initializeContainerDimensions() {
        const element = this.elementRef.nativeElement;
        if (element && element.clientWidth > 0 && element.clientHeight > 0) {
            // Seed the size for the first paint; the ResizeObserver keeps it in sync afterwards.
            this.containerSize.set({ width: element.clientWidth, height: element.clientHeight });
        }
    }

    private setupImageLoadEffect() {
        effect(() => {
            const image = this.image();
            this.offset.set({ x: 0, y: 0 });

            if (!this.isZoomControlled()) {
                this.internalZoom.set(this.minZoom());
            }

            if (!image || !this.isBrowser) {
                this.imgWidth.set(null);
                this.imgHeight.set(null);
                return;
            }

            let isMounted = true;
            const img = new Image();
            img.onload = () => {
                if (isMounted) {
                    this.imgWidth.set(img.naturalWidth);
                    this.imgHeight.set(img.naturalHeight);
                }
            };
            img.onerror = () => {
                if (isMounted) {
                    this.imgWidth.set(null);
                    this.imgHeight.set(null);
                }
            };
            img.src = image;

            return () => {
                isMounted = false;
            };
        });
    }

    private setupDimensionsEffects(): void {
        // Track the container's content-box size via the shared resize-observer effect; `cropAreaSize`
        // derives crop dimensions from it reactively (so changing `aspectRatio` / `cropPadding`
        // recomputes without waiting for a resize). `element` is null on the server, so no observer is
        // constructed (SSR-safe).
        resizeEffect({
            injector: this.injector,
            element: computed(() => (this.isBrowser ? this.elementRef.nativeElement : null)),
            onResize: (entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) this.containerSize.set({ width, height });
                }
            }
        });

        // Update image wrapper dimensions when crop area or image dimensions change
        effect(() => {
            const cropW = this.cropAreaWidth();
            const cropH = this.cropAreaHeight();
            const imgW = this.imgWidth();
            const imgH = this.imgHeight();

            if (cropW <= 0 || cropH <= 0 || !imgW || !imgH) {
                this.imageWrapperWidth.set(0);
                this.imageWrapperHeight.set(0);
                return;
            }

            const naturalAspect = imgW / imgH;
            const cropAspect = cropW / cropH;
            let targetWrapperWidth: number, targetWrapperHeight: number;

            if (naturalAspect >= cropAspect) {
                targetWrapperHeight = cropH;
                targetWrapperWidth = targetWrapperHeight * naturalAspect;
            } else {
                targetWrapperWidth = cropW;
                targetWrapperHeight = targetWrapperWidth / naturalAspect;
            }

            this.imageWrapperWidth.set(targetWrapperWidth);
            this.imageWrapperHeight.set(targetWrapperHeight);
        });
    }

    /** Current rendered geometry the crop math operates on, read from the state signals. */
    private geometry(): CropperGeometry {
        return {
            wrapperWidth: this.imageWrapperWidth(),
            wrapperHeight: this.imageWrapperHeight(),
            cropWidth: this.cropAreaWidth(),
            cropHeight: this.cropAreaHeight()
        };
    }

    private restrictOffset(dragOffsetX: number, dragOffsetY: number, currentZoom: number): { x: number; y: number } {
        return computeRestrictedOffset(dragOffsetX, dragOffsetY, currentZoom, this.geometry());
    }

    private setupAccessibilityWarningEffect(): void {
        if (!this.isBrowser) return;

        effect(() => {
            const checkTimeout = setTimeout(() => {
                if (this.elementRef.nativeElement && !this.hasWarned()) {
                    const hasDescription = document.getElementById(this.descriptionId);
                    if (!hasDescription) {
                        console.warn(this.CROPPER_DESC_WARN_MESSAGE);
                        this.hasWarned.set(true);
                    }
                }
            }, 100);

            return () => clearTimeout(checkTimeout);
        });
    }

    /**
     * Single attachment point for every interaction listener. Re-runs on `disabled()`, so a disabled
     * cropper has NO interaction listeners bound at all — there is no per-handler `disabled` check to
     * forget, and a new gesture path can't accidentally bypass the gate. Uses `{ passive: false }` so
     * the handlers can `preventDefault()` (wheel/touch scrolling, arrow-key page scroll).
     */
    private setupEventListenersEffect(): void {
        if (!this.isBrowser) return;

        effect((onCleanup) => {
            const node = this.elementRef.nativeElement;
            if (!node || this.disabled()) return;

            const options: AddEventListenerOptions = { passive: false };

            const mouseDownHandler = (e: MouseEvent) => this.onMouseDown(e);
            const keyDownHandler = (e: KeyboardEvent) => this.onKeyDown(e);
            const wheelHandler = (e: WheelEvent) => this.handleWheel(e);
            const touchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
            const touchMoveHandler = (e: TouchEvent) => this.handleTouchMove(e);
            const touchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e);

            node.addEventListener('mousedown', mouseDownHandler, options);
            node.addEventListener('keydown', keyDownHandler, options);
            node.addEventListener('wheel', wheelHandler, options);
            node.addEventListener('touchstart', touchStartHandler, options);
            node.addEventListener('touchmove', touchMoveHandler, options);
            node.addEventListener('touchend', touchEndHandler, options);
            node.addEventListener('touchcancel', touchEndHandler, options);

            onCleanup(() => {
                node.removeEventListener('mousedown', mouseDownHandler, options);
                node.removeEventListener('keydown', keyDownHandler, options);
                node.removeEventListener('wheel', wheelHandler, options);
                node.removeEventListener('touchstart', touchStartHandler, options);
                node.removeEventListener('touchmove', touchMoveHandler, options);
                node.removeEventListener('touchend', touchEndHandler, options);
                node.removeEventListener('touchcancel', touchEndHandler, options);
            });
        });
    }

    private onMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;
        e.preventDefault();
        this.isDragging.set(true);
        this.isPinching.set(false);
        this.dragStartPoint.set({ x: e.clientX, y: e.clientY });
        this.dragStartOffset.set(this.clampedOffset());

        const handleMouseMove = (ev: MouseEvent) => {
            const deltaX = ev.clientX - this.dragStartPoint().x;
            const deltaY = ev.clientY - this.dragStartPoint().y;
            this.offset.set({ x: this.dragStartOffset().x + deltaX, y: this.dragStartOffset().y + deltaY });
        };

        const handleMouseUp = () => {
            this.isDragging.set(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    /**
     * Zoom toward an anchor point (coordinates relative to the root's center). `fromZoom`/`fromOffset`
     * are the zoom/offset the anchor is measured against — the live state for wheel/keyboard, the
     * gesture-start baseline for pinch. Emits the zoom request via {@link updateZoom}, then re-anchors
     * the pan offset **only when the zoom is uncontrolled**: in controlled mode the rendered zoom does
     * not change until the parent writes `zoom` back, so writing an offset for a not-yet-applied zoom
     * would pan the image without rescaling it (`clampedOffset` re-derives once the new zoom applies).
     */
    private zoomToPoint(
        pointerX: number,
        pointerY: number,
        targetZoom: number,
        fromZoom: number,
        fromOffset: { x: number; y: number }
    ): void {
        const clampedZoom = clamp(targetZoom, this.minZoom(), this.maxZoom());
        if (clampedZoom === this.effectiveZoom()) return;

        const imagePointX = (pointerX - fromOffset.x) / fromZoom;
        const imagePointY = (pointerY - fromOffset.y) / fromZoom;

        const finalNewZoom = this.updateZoom(clampedZoom);
        if (this.isZoomControlled()) return;

        this.offset.set({ x: pointerX - imagePointX * finalNewZoom, y: pointerY - imagePointY * finalNewZoom });
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        e.stopPropagation();
        if (!this.elementRef.nativeElement || this.imageWrapperWidth() <= 0 || this.imageWrapperHeight() <= 0) return;

        const delta = e.deltaY * -this.zoomSensitivity();
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const pointerX = e.clientX - rect.left - rect.width / 2;
        const pointerY = e.clientY - rect.top - rect.height / 2;

        this.zoomToPoint(pointerX, pointerY, this.effectiveZoom() + delta, this.effectiveZoom(), this.clampedOffset());
    }

    private getPinchDistance(touches: TouchList): number {
        return Math.sqrt(
            Math.pow(touches[1].clientX - touches[0].clientX, 2) + Math.pow(touches[1].clientY - touches[0].clientY, 2)
        );
    }

    private getPinchCenter(touches: TouchList): { x: number; y: number } {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    private handleTouchStart(e: TouchEvent): void {
        if (this.imageWrapperWidth() <= 0 || this.imageWrapperHeight() <= 0) return;
        e.preventDefault();
        const touches = e.touches;

        if (touches.length === 1) {
            this.isDragging.set(true);
            this.isPinching.set(false);
            this.dragStartPoint.set({ x: touches[0].clientX, y: touches[0].clientY });
            this.dragStartOffset.set(this.clampedOffset());
        } else if (touches.length === 2) {
            this.isDragging.set(false);
            this.isPinching.set(true);
            this.initialPinchDistance.set(this.getPinchDistance(touches));
            this.initialPinchZoom.set(this.latestZoom());
            this.dragStartOffset.set(this.clampedOffset());
        }
    }

    private handleTouchMove(e: TouchEvent): void {
        if (this.imageWrapperWidth() <= 0 || this.imageWrapperHeight() <= 0) return;
        e.preventDefault();
        const touches = e.touches;

        if (touches.length === 1 && this.isDragging() && !this.isPinching()) {
            const deltaX = touches[0].clientX - this.dragStartPoint().x;
            const deltaY = touches[0].clientY - this.dragStartPoint().y;
            this.offset.set({ x: this.dragStartOffset().x + deltaX, y: this.dragStartOffset().y + deltaY });
        } else if (touches.length === 2 && this.isPinching()) {
            const scale = this.getPinchDistance(touches) / this.initialPinchDistance();
            const pinchCenter = this.getPinchCenter(touches);
            const rect = this.elementRef.nativeElement.getBoundingClientRect();
            const pinchCenterX = pinchCenter.x - rect.left - rect.width / 2;
            const pinchCenterY = pinchCenter.y - rect.top - rect.height / 2;

            // Pinch is baseline-relative: anchor against the zoom/offset captured at gesture start.
            this.zoomToPoint(
                pinchCenterX,
                pinchCenterY,
                this.initialPinchZoom() * scale,
                this.initialPinchZoom(),
                this.dragStartOffset()
            );
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        e.preventDefault();
        const touches = e.touches;

        if (this.isPinching() && touches.length < 2) {
            this.isPinching.set(false);

            if (touches.length === 1) {
                this.isDragging.set(true);
                this.dragStartPoint.set({ x: touches[0].clientX, y: touches[0].clientY });
                this.dragStartOffset.set(this.clampedOffset());
            } else {
                this.isDragging.set(false);
            }
        } else if (this.isDragging() && touches.length === 0) {
            this.isDragging.set(false);
        }
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (this.imageWrapperWidth() <= 0) return;

        const base = this.clampedOffset();
        let targetOffsetX = base.x;
        let targetOffsetY = base.y;
        // eslint-disable-next-line no-useless-assignment
        let moved = false;

        switch (e.key) {
            case 'ArrowUp':
                targetOffsetY += this.keyboardStep();
                moved = true;
                break;
            case 'ArrowDown':
                targetOffsetY -= this.keyboardStep();
                moved = true;
                break;
            case 'ArrowLeft':
                targetOffsetX += this.keyboardStep();
                moved = true;
                break;
            case 'ArrowRight':
                targetOffsetX -= this.keyboardStep();
                moved = true;
                break;
            case '+':
            case '=':
            case 'PageUp':
                e.preventDefault();
                this.zoomFromCenter(this.zoomKeyboardStep());
                return;
            case '-':
            case '_':
            case 'PageDown':
                e.preventDefault();
                this.zoomFromCenter(-this.zoomKeyboardStep());
                return;
            default:
                return;
        }

        if (moved) {
            e.preventDefault();
            // Write the raw target; `clampedOffset` clamps it (and dedups a no-op at the boundary).
            this.offset.set({ x: targetOffsetX, y: targetOffsetY });
        }
    }

    /** Zoom by `delta` keeping the crop center fixed (the keyboard counterpart of wheel/pinch zoom). */
    private zoomFromCenter(delta: number): void {
        if (this.imageWrapperWidth() <= 0 || this.imageWrapperHeight() <= 0) return;
        // Anchor at the crop center (pointer 0,0 relative to center) against the live zoom/offset.
        this.zoomToPoint(0, 0, this.effectiveZoom() + delta, this.effectiveZoom(), this.clampedOffset());
    }

    /**
     * Inline style for the image wrapper: measured size, centered in the root, then translated and
     * scaled by the current pan offset and zoom. A `computed` (not a method) so the `[style]` binding
     * only re-applies when an input actually changes — a per-change-detection method call would
     * allocate a new object every tick and force a constant re-bind.
     */
    readonly imageWrapperStyle = computed<Record<string, string>>(() => {
        const wrapperW = this.imageWrapperWidth();
        const wrapperH = this.imageWrapperHeight();
        const { x: offsetX, y: offsetY } = this.clampedOffset();
        const zoom = this.effectiveZoom();

        return {
            width: `${wrapperW}px`,
            height: `${wrapperH}px`,
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0px) scale(${zoom})`,
            position: 'absolute',
            left: `calc(50% - ${wrapperW / 2}px)`,
            top: `calc(50% - ${wrapperH / 2}px)`,
            willChange: 'transform'
        };
    });

    /** Inline style for the crop-area overlay (its measured width/height). */
    readonly cropAreaStyle = computed<Record<string, string>>(() => ({
        width: `${this.cropAreaWidth()}px`,
        height: `${this.cropAreaHeight()}px`
    }));
}
