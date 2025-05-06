// Based on https://github.com/origin-space/image-cropper/blob/main/src/Cropper.tsx

import { NumberInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    computed,
    Directive,
    effect,
    ElementRef,
    input,
    numberAttribute,
    output,
    signal
} from '@angular/core';
import { clamp, provideToken } from '@radix-ng/primitives/core';
import { CROPPER_ROOT_CONTEXT, CropperContextToken } from './cropper-context.token';

export type Area = { x: number; y: number; width: number; height: number };

@Directive({
    selector: '[rdxCropperRoot]',
    providers: [provideToken(CROPPER_ROOT_CONTEXT, RdxCropperRootDirective)],
    host: {
        '[attr.aria-label]': '"Interactive image cropper"',
        '[attr.aria-describedby]': 'descriptionId()',
        '[attr.aria-valuemin]': 'minZoom()',
        '[attr.aria-valuemax]': 'maxZoom()',
        '[attr.aria-valuenow]': 'effectiveZoom()',
        '[attr.aria-valuetext]': 'zoomValueText()',
        tabindex: '0',
        role: 'application',
        '(mousedown)': 'onMouseDown($event)',
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp($event)'
    }
})
export class RdxCropperRootDirective implements CropperContextToken {
    private readonly CROPPER_DESC_WARN_MESSAGE = `Warning: \`Cropper\` requires a description element for accessibility.`;

    readonly image = input.required<string>();
    readonly cropPadding = input(25, { transform: numberAttribute });
    readonly aspectRatio = input(1, { transform: numberAttribute });
    readonly minZoom = input(1, { transform: numberAttribute });
    readonly maxZoom = input(3, { transform: numberAttribute });
    readonly zoomSensitivity = input(0.005, { transform: numberAttribute });
    readonly keyboardStep = input(10, { transform: numberAttribute });
    readonly zoom = input<number, NumberInput>(undefined, { transform: numberAttribute });

    readonly cropChange = output<Area | null>();
    readonly zoomChange = output<number>();

    // State signals
    readonly imgWidth = signal<number | null>(null);
    readonly imgHeight = signal<number | null>(null);
    readonly cropAreaWidth = signal(0);
    readonly cropAreaHeight = signal(0);
    readonly imageWrapperWidth = signal(0);
    readonly imageWrapperHeight = signal(0);
    readonly offsetX = signal(0);
    readonly offsetY = signal(0);
    readonly internalZoom = signal(this.minZoom());
    readonly isDragging = signal(false);
    readonly descriptionId = signal(`cropper-${Math.random().toString(36).substring(2, 9)}`);

    readonly isZoomControlled = computed(() => this.zoom() !== undefined);
    readonly effectiveZoom = computed(() => (this.isZoomControlled() ? this.zoom()! : this.internalZoom()));
    readonly zoomValueText = computed(() => {
        const zoomPercent = this.effectiveZoom() * 100;
        return `Zoom: ${zoomPercent.toFixed(0)}%`;
    });

    // Refs
    private readonly dragStartPoint = signal({ x: 0, y: 0 });
    private readonly dragStartOffset = signal({ x: 0, y: 0 });
    private readonly latestRestrictedOffset = signal({ x: 0, y: 0 });
    private readonly latestZoom = signal(this.minZoom());
    private readonly isInitialSetupDone = signal(false);
    private readonly initialPinchDistance = signal(0);
    private readonly initialPinchZoom = signal(1);
    private readonly isPinching = signal(false);
    private readonly hasWarned = signal(false);

    constructor(private el: ElementRef<HTMLElement>) {
        afterNextRender(() => {
            this.initializeContainerDimensions();
        });

        this.setupImageLoadEffect();
        this.setupDimensionsEffects();
        this.setupCropCalculationEffect();
        this.setupAccessibilityWarningEffect();
        this.setupEventListenersEffect();

        effect(() => {
            this.latestZoom.set(this.effectiveZoom());
        });
    }

    private updateZoom(newZoomValue: number): number {
        const clampedZoom = clamp(newZoomValue, this.minZoom(), this.maxZoom());

        this.zoomChange.emit(clampedZoom);

        if (!this.isZoomControlled()) {
            this.internalZoom.set(clampedZoom);
        }
        return clampedZoom;
    }

    private initializeContainerDimensions() {
        const element = this.el.nativeElement;
        if (element && element.clientWidth > 0 && element.clientHeight > 0) {
            this.cropAreaWidth.set(Math.max(0, element.clientWidth - this.cropPadding() * 2));
            this.cropAreaHeight.set(Math.max(0, element.clientHeight - this.cropPadding() * 2));
        }
    }

    private setupImageLoadEffect() {
        effect(() => {
            const image = this.image();
            this.offsetX.set(0);
            this.offsetY.set(0);

            if (!this.isZoomControlled()) {
                this.internalZoom.set(this.minZoom());
            }

            this.isInitialSetupDone.set(false);

            if (!image) {
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
        effect(() => {
            const element = this.el.nativeElement;
            if (!element) return;

            const updateDimensions = (width: number, height: number) => {
                if (width <= 0 || height <= 0) {
                    this.cropAreaWidth.set(0);
                    this.cropAreaHeight.set(0);
                    return;
                }

                const maxPossibleWidth = Math.max(0, width - this.cropPadding() * 2);
                const maxPossibleHeight = Math.max(0, height - this.cropPadding() * 2);
                let targetCropW: number, targetCropH: number;

                if (maxPossibleWidth / this.aspectRatio() >= maxPossibleHeight) {
                    targetCropH = maxPossibleHeight;
                    targetCropW = targetCropH * this.aspectRatio();
                } else {
                    targetCropW = maxPossibleWidth;
                    targetCropH = targetCropW / this.aspectRatio();
                }

                this.cropAreaWidth.set(targetCropW);
                this.cropAreaHeight.set(targetCropH);
            };

            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) updateDimensions(width, height);
                }
            });

            observer.observe(element);
            const initialWidth = element.clientWidth;
            const initialHeight = element.clientHeight;
            if (initialWidth > 0 && initialHeight > 0) {
                updateDimensions(initialWidth, initialHeight);
            }

            return () => observer.disconnect();
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

    private restrictOffset(dragOffsetX: number, dragOffsetY: number, currentZoom: number): { x: number; y: number } {
        const wrapperW = this.imageWrapperWidth();
        const wrapperH = this.imageWrapperHeight();
        const cropW = this.cropAreaWidth();
        const cropH = this.cropAreaHeight();

        if (wrapperW <= 0 || wrapperH <= 0 || cropW <= 0 || cropH <= 0) {
            return { x: 0, y: 0 };
        }

        const effectiveWrapperWidth = wrapperW * currentZoom;
        const effectiveWrapperHeight = wrapperH * currentZoom;
        const maxDragX = Math.max(0, (effectiveWrapperWidth - cropW) / 2);
        const maxDragY = Math.max(0, (effectiveWrapperHeight - cropH) / 2);

        return {
            x: clamp(dragOffsetX, -maxDragX, maxDragX),
            y: clamp(dragOffsetY, -maxDragY, maxDragY)
        };
    }

    private calculateCropData(finalOffsetX?: number, finalOffsetY?: number, finalZoom?: number): Area | null {
        const currentOffsetX = finalOffsetX ?? this.latestRestrictedOffset().x;
        const currentOffsetY = finalOffsetY ?? this.latestRestrictedOffset().y;
        const currentZoom = finalZoom ?? this.effectiveZoom();
        const imgW = this.imgWidth();
        const imgH = this.imgHeight();
        const wrapperW = this.imageWrapperWidth();
        const wrapperH = this.imageWrapperHeight();
        const cropW = this.cropAreaWidth();
        const cropH = this.cropAreaHeight();

        if (!imgW || !imgH || wrapperW <= 0 || wrapperH <= 0 || cropW <= 0 || cropH <= 0) {
            return null;
        }

        const scaledWrapperWidth = wrapperW * currentZoom;
        const scaledWrapperHeight = wrapperH * currentZoom;
        const topLeftOffsetX = currentOffsetX + (cropW - scaledWrapperWidth) / 2;
        const topLeftOffsetY = currentOffsetY + (cropH - scaledWrapperHeight) / 2;
        const baseScale = imgW / wrapperW;

        if (isNaN(baseScale) || baseScale === 0) {
            return null;
        }

        const sx = (-topLeftOffsetX * baseScale) / currentZoom;
        const sy = (-topLeftOffsetY * baseScale) / currentZoom;
        const sWidth = (cropW * baseScale) / currentZoom;
        const sHeight = (cropH * baseScale) / currentZoom;

        const finalX = clamp(Math.round(sx), 0, imgW);
        const finalY = clamp(Math.round(sy), 0, imgH);
        const finalWidth = clamp(Math.round(sWidth), 0, imgW - finalX);
        const finalHeight = clamp(Math.round(sHeight), 0, imgH - finalY);

        if (finalWidth <= 0 || finalHeight <= 0) {
            return null;
        }

        return { x: finalX, y: finalY, width: finalWidth, height: finalHeight };
    }

    private setupCropCalculationEffect(): void {
        effect(() => {
            const wrapperW = this.imageWrapperWidth();
            const wrapperH = this.imageWrapperHeight();
            const cropW = this.cropAreaWidth();
            const cropH = this.cropAreaHeight();
            const currentZoom = this.effectiveZoom();

            if (wrapperW > 0 && wrapperH > 0 && cropW > 0 && cropH > 0) {
                if (!this.isInitialSetupDone()) {
                    const restrictedInitial = this.restrictOffset(0, 0, currentZoom);
                    this.offsetX.set(restrictedInitial.x);
                    this.offsetY.set(restrictedInitial.y);

                    if (!this.isZoomControlled()) {
                        this.internalZoom.set(currentZoom);
                    }

                    this.dragStartOffset.set(restrictedInitial);
                    this.latestRestrictedOffset.set(restrictedInitial);
                    this.latestZoom.set(currentZoom);

                    this.cropChange.emit(this.calculateCropData(restrictedInitial.x, restrictedInitial.y, currentZoom));

                    this.isInitialSetupDone.set(true);
                } else {
                    const currentX = this.latestRestrictedOffset().x;
                    const currentY = this.latestRestrictedOffset().y;
                    const restrictedCurrent = this.restrictOffset(currentX, currentY, currentZoom);

                    if (restrictedCurrent.x !== currentX || restrictedCurrent.y !== currentY) {
                        this.offsetX.set(restrictedCurrent.x);
                        this.offsetY.set(restrictedCurrent.y);
                        this.latestRestrictedOffset.set(restrictedCurrent);
                        this.dragStartOffset.set(restrictedCurrent);
                    }

                    this.cropChange.emit(this.calculateCropData(restrictedCurrent.x, restrictedCurrent.y, currentZoom));
                }
            } else {
                this.isInitialSetupDone.set(false);
                this.offsetX.set(0);
                this.offsetY.set(0);

                if (!this.isZoomControlled()) {
                    this.internalZoom.set(this.minZoom());
                }

                this.dragStartOffset.set({ x: 0, y: 0 });
                this.latestRestrictedOffset.set({ x: 0, y: 0 });
                this.latestZoom.set(currentZoom);
                this.cropChange.emit(null);
            }
        });
    }

    private setupAccessibilityWarningEffect(): void {
        effect(() => {
            const checkTimeout = setTimeout(() => {
                if (this.el.nativeElement && !this.hasWarned()) {
                    const hasDescription = document.getElementById(this.descriptionId());
                    if (!hasDescription) {
                        console.warn(this.CROPPER_DESC_WARN_MESSAGE);
                        this.hasWarned.set(true);
                    }
                }
            }, 100);

            return () => clearTimeout(checkTimeout);
        });
    }

    private setupEventListenersEffect(): void {
        effect((onCleanup) => {
            const node = this.el.nativeElement;
            if (!node) return;

            const options = { passive: false } as any;

            const wheelHandler = (e: WheelEvent) => this.handleWheel(e);
            const touchStartHandler = (e: TouchEvent) => this.handleTouchStart(e);
            const touchMoveHandler = (e: TouchEvent) => this.handleTouchMove(e);
            const touchEndHandler = (e: TouchEvent) => this.handleTouchEnd(e);

            node.addEventListener('wheel', wheelHandler, options);
            node.addEventListener('touchstart', touchStartHandler, options);
            node.addEventListener('touchmove', touchMoveHandler, options);
            node.addEventListener('touchend', touchEndHandler, options);
            node.addEventListener('touchcancel', touchEndHandler, options);

            onCleanup(() => {
                node.removeEventListener('wheel', wheelHandler, options);
                node.removeEventListener('touchstart', touchStartHandler, options);
                node.removeEventListener('touchmove', touchMoveHandler, options);
                node.removeEventListener('touchend', touchEndHandler, options);
                node.removeEventListener('touchcancel', touchEndHandler, options);
            });
        });
    }

    private handleInteractionEnd(): void {
        const finalData = this.calculateCropData(
            this.latestRestrictedOffset().x,
            this.latestRestrictedOffset().y,
            this.effectiveZoom()
        );
        this.cropChange.emit(finalData);
    }

    onMouseDown(e: MouseEvent): void {
        if (e.button !== 0) return;
        e.preventDefault();
        this.isDragging.set(true);
        this.isPinching.set(false);
        this.dragStartPoint.set({ x: e.clientX, y: e.clientY });
        this.dragStartOffset.set(this.latestRestrictedOffset());

        const handleMouseMove = (ev: MouseEvent) => {
            const deltaX = ev.clientX - this.dragStartPoint().x;
            const deltaY = ev.clientY - this.dragStartPoint().y;
            const targetOffsetX = this.dragStartOffset().x + deltaX;
            const targetOffsetY = this.dragStartOffset().y + deltaY;
            const restricted = this.restrictOffset(targetOffsetX, targetOffsetY, this.effectiveZoom());
            this.latestRestrictedOffset.set(restricted);
            this.offsetX.set(restricted.x);
            this.offsetY.set(restricted.y);
        };

        const handleMouseUp = () => {
            this.isDragging.set(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            this.handleInteractionEnd();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        e.stopPropagation();
        if (!this.el.nativeElement || this.imageWrapperWidth() <= 0 || this.imageWrapperHeight() <= 0) return;

        const currentZoom = this.latestZoom();
        const currentOffsetX = this.latestRestrictedOffset().x;
        const currentOffsetY = this.latestRestrictedOffset().y;
        const delta = e.deltaY * -this.zoomSensitivity();
        const targetZoom = currentZoom + delta;

        if (clamp(targetZoom, this.minZoom(), this.maxZoom()) === currentZoom) return;

        const rect = this.el.nativeElement.getBoundingClientRect();
        const pointerX = e.clientX - rect.left - rect.width / 2;
        const pointerY = e.clientY - rect.top - rect.height / 2;
        const imagePointX = (pointerX - currentOffsetX) / currentZoom;
        const imagePointY = (pointerY - currentOffsetY) / currentZoom;

        const finalNewZoom = this.updateZoom(targetZoom);

        const newOffsetX = pointerX - imagePointX * finalNewZoom;
        const newOffsetY = pointerY - imagePointY * finalNewZoom;
        const restrictedNewOffset = this.restrictOffset(newOffsetX, newOffsetY, finalNewZoom);

        this.offsetX.set(restrictedNewOffset.x);
        this.offsetY.set(restrictedNewOffset.y);
        this.latestRestrictedOffset.set(restrictedNewOffset);

        const finalData = this.calculateCropData(restrictedNewOffset.x, restrictedNewOffset.y, finalNewZoom);
        this.cropChange.emit(finalData);
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
            this.dragStartOffset.set(this.latestRestrictedOffset());
        } else if (touches.length === 2) {
            this.isDragging.set(false);
            this.isPinching.set(true);
            this.initialPinchDistance.set(this.getPinchDistance(touches));
            this.initialPinchZoom.set(this.latestZoom());
            this.dragStartOffset.set(this.latestRestrictedOffset());
        }
    }

    private handleTouchMove(e: TouchEvent): void {
        if (this.imageWrapperWidth() <= 0 || this.imageWrapperHeight() <= 0) return;
        e.preventDefault();
        const touches = e.touches;

        if (touches.length === 1 && this.isDragging() && !this.isPinching()) {
            const deltaX = touches[0].clientX - this.dragStartPoint().x;
            const deltaY = touches[0].clientY - this.dragStartPoint().y;
            const targetOffsetX = this.dragStartOffset().x + deltaX;
            const targetOffsetY = this.dragStartOffset().y + deltaY;
            const restricted = this.restrictOffset(targetOffsetX, targetOffsetY, this.effectiveZoom());
            this.latestRestrictedOffset.set(restricted);
            this.offsetX.set(restricted.x);
            this.offsetY.set(restricted.y);
        } else if (touches.length === 2 && this.isPinching()) {
            const currentPinchDistance = this.getPinchDistance(touches);
            const scale = currentPinchDistance / this.initialPinchDistance();
            const currentZoom = this.initialPinchZoom();
            const targetZoom = currentZoom * scale;

            if (clamp(targetZoom, this.minZoom(), this.maxZoom()) === this.latestZoom()) return;

            const pinchCenter = this.getPinchCenter(touches);
            const rect = this.el.nativeElement.getBoundingClientRect();
            const pinchCenterX = pinchCenter.x - rect.left - rect.width / 2;
            const pinchCenterY = pinchCenter.y - rect.top - rect.height / 2;
            const currentOffsetX = this.dragStartOffset().x;
            const currentOffsetY = this.dragStartOffset().y;
            const imagePointX = (pinchCenterX - currentOffsetX) / currentZoom;
            const imagePointY = (pinchCenterY - currentOffsetY) / currentZoom;

            const finalNewZoom = this.updateZoom(targetZoom);

            const newOffsetX = pinchCenterX - imagePointX * finalNewZoom;
            const newOffsetY = pinchCenterY - imagePointY * finalNewZoom;
            const restrictedNewOffset = this.restrictOffset(newOffsetX, newOffsetY, finalNewZoom);

            this.offsetX.set(restrictedNewOffset.x);
            this.offsetY.set(restrictedNewOffset.y);
            this.latestRestrictedOffset.set(restrictedNewOffset);

            const finalData = this.calculateCropData(restrictedNewOffset.x, restrictedNewOffset.y, finalNewZoom);
            this.cropChange.emit(finalData);
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
                this.dragStartOffset.set(this.latestRestrictedOffset());
            } else {
                this.isDragging.set(false);
                this.handleInteractionEnd();
            }
        } else if (this.isDragging() && touches.length === 0) {
            this.isDragging.set(false);
            this.handleInteractionEnd();
        }
    }

    onKeyDown(e: KeyboardEvent): void {
        if (this.imageWrapperWidth() <= 0) return;

        let targetOffsetX = this.latestRestrictedOffset().x;
        let targetOffsetY = this.latestRestrictedOffset().y;
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
            default:
                return;
        }

        if (moved) {
            e.preventDefault();
            const restricted = this.restrictOffset(targetOffsetX, targetOffsetY, this.effectiveZoom());
            if (restricted.x !== this.latestRestrictedOffset().x || restricted.y !== this.latestRestrictedOffset().y) {
                this.latestRestrictedOffset.set(restricted);
                this.offsetX.set(restricted.x);
                this.offsetY.set(restricted.y);
            }
        }
    }

    onKeyUp(e: KeyboardEvent): void {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.handleInteractionEnd();
        }
    }

    getImageProps(): { [key: string]: any } {
        return {
            src: this.image(),
            alt: 'Image being cropped',
            draggable: false,
            'aria-hidden': true
        };
    }

    getImageWrapperStyle(): Record<string, string> {
        const wrapperW = this.imageWrapperWidth();
        const wrapperH = this.imageWrapperHeight();
        const offsetX = this.offsetX();
        const offsetY = this.offsetY();
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
    }

    getCropAreaStyle(): Record<string, string> {
        return {
            width: `${this.cropAreaWidth()}px`,
            height: `${this.cropAreaHeight()}px`
        };
    }
}
