import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    output,
    signal
} from '@angular/core';

function isLayerExist(layerElement: HTMLElement, targetElement: HTMLElement) {
    const targetLayer = targetElement.closest('[data-dismissable-layer]');

    const mainLayer =
        layerElement.dataset['dismissableLayer'] === ''
            ? layerElement
            : (layerElement.querySelector('[data-dismissable-layer]') as HTMLElement);

    const nodeList = Array.from(layerElement.ownerDocument.querySelectorAll('[data-dismissable-layer]'));

    if (targetLayer && (mainLayer === targetLayer || nodeList.indexOf(mainLayer) < nodeList.indexOf(targetLayer))) {
        return true;
    } else {
        return false;
    }
}

/**
 * Listens for when focus happens outside a DOM subtree.
 * Returns props to pass to the root (node) of the subtree we want to check.
 */
@Directive({
    selector: '[rdxFocusOutside]',
    exportAs: 'rdxFocusOutside'
})
export class RdxFocusOutside {
    readonly enabledInput = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'enabled' });

    readonly #enabled = linkedSignal(() => this.enabledInput());

    set enabled(value: boolean) {
        if (this.#enabled() !== value) {
            this.#enabled.set(value);
        }
    }

    get enabled() {
        return this.#enabled();
    }

    readonly focusOutside = output<FocusEvent>();

    /*
     * Flag to indicate if the focus is currently within the DOM subtree
     */
    private readonly isFocusInsideDOMTree = signal(false);

    /*
     * Handles capturing the focus event to mark focus as inside the DOM subtree
     */
    private readonly focusCaptureHandler = () => {
        if (!this.enabled) return;
        this.isFocusInsideDOMTree.set(true);
    };

    /*
     * Handles capturing the blur event to mark focus as outside the DOM subtree
     */
    private readonly blurCaptureHandler = () => {
        if (!this.enabled) return;
        this.isFocusInsideDOMTree.set(false);
    };

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

        effect((onCleanup) => {
            if (!this.#enabled()) {
                return;
            }

            const ownerDocument = elementRef.nativeElement.ownerDocument ?? globalThis.document;

            const focusHandler = async (event: FocusEvent) => {
                if (!elementRef?.nativeElement) {
                    return;
                }

                await Promise.resolve();
                await Promise.resolve();

                const target = event.target as HTMLElement | undefined;
                if (!elementRef.nativeElement || !target || isLayerExist(elementRef.nativeElement, target)) {
                    return;
                }

                if (target && !this.isFocusInsideDOMTree()) {
                    this.focusOutside.emit(event);
                }
            };

            elementRef.nativeElement.addEventListener('focus', this.focusCaptureHandler, {
                capture: true
            });
            elementRef.nativeElement.addEventListener('blur', this.blurCaptureHandler, {
                capture: true
            });

            ownerDocument.addEventListener('focusin', focusHandler);

            onCleanup(() => {
                elementRef.nativeElement.removeEventListener('focus', this.focusCaptureHandler, {
                    capture: true
                });

                elementRef.nativeElement.removeEventListener('blur', this.blurCaptureHandler, {
                    capture: true
                });

                ownerDocument.removeEventListener('focusin', focusHandler);
            });
        });
    }
}

/**
 * Listens for `pointerdown` outside a DOM subtree. We use `pointerdown` rather than `pointerup`
 * to mimic layer dismissing behavior present in OS.
 * Returns props to pass to the node we want to check for outside events.
 */
@Directive({
    selector: '[rdxPointerDownOutside]',
    exportAs: 'rdxPointerDownOutside'
})
export class RdxPointerDownOutside {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly enabledInput = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'enabled' });

    readonly #enabled = linkedSignal(() => this.enabledInput());

    set enabled(value: boolean) {
        if (this.#enabled() !== value) {
            this.#enabled.set(value);
        }
    }

    get enabled() {
        return this.#enabled();
    }

    readonly pointerDownOutside = output<PointerEvent>();

    private readonly isPointerInsideDOMTree = signal(false);

    private readonly handleAndDispatchPointerDownOutsideEvent = (e: PointerEvent) => () =>
        this.pointerDownOutside.emit(e);

    private handleClick: () => void | undefined;

    constructor() {
        effect((onCleanup) => {
            if (!this.#enabled()) {
                return;
            }

            const ownerDocument = this.elementRef.nativeElement.ownerDocument ?? globalThis.document;

            const handlePointerDown = async (event: PointerEvent) => {
                if (event.target && !this.isPointerInsideDOMTree()) {
                    /**
                     * On touch devices, we need to wait for a click event because browsers implement
                     * a ~350ms delay between the time the user stops touching the display and when the
                     * browser executres events. We need to ensure we don't reactivate pointer-events within
                     * this timeframe otherwise the browser may execute events that should have been prevented.
                     *
                     * Additionally, this also lets us deal automatically with cancellations when a click event
                     * isn't raised because the page was considered scrolled/drag-scrolled, long-pressed, etc.
                     *
                     * This is why we also continuously remove the previous listener, because we cannot be
                     * certain that it was raised, and therefore cleaned-up.
                     */
                    if (event.pointerType === 'touch') {
                        ownerDocument.removeEventListener('click', this.handleClick);
                        this.handleClick = this.handleAndDispatchPointerDownOutsideEvent(event);
                        ownerDocument.addEventListener('click', this.handleClick, {
                            once: true
                        });
                    } else {
                        this.pointerDownOutside.emit(event);
                    }
                } else {
                    // We need to remove the event listener in case the outside click has been canceled.
                    // See: https://github.com/radix-ui/primitives/issues/2171
                    ownerDocument.removeEventListener('click', this.handleClick);
                }
                this.isPointerInsideDOMTree.set(false);
            };
            /**
             * if this directive executes in a component that mounts via a `pointerdown` event, the event
             * would bubble up to the document and trigger a `pointerDownOutside` event. We avoid
             * this by delaying the event listener registration on the document.
             * This is not Angular specific, but rather how the DOM works, ie:
             * ```
             * button.addEventListener('pointerdown', () => {
             *   console.log('I will log');
             *   document.addEventListener('pointerdown', () => {
             *     console.log('I will also log');
             *   })
             * });
             */
            const timerId = window.setTimeout(() => {
                ownerDocument.addEventListener('pointerdown', handlePointerDown);
            }, 0);

            const onPointerDownCapture = () => {
                if (!this.enabled) {
                    return;
                }
                this.isPointerInsideDOMTree.set(true);
            };

            this.elementRef.nativeElement.addEventListener('pointerdown', onPointerDownCapture, { capture: true });

            onCleanup(() => {
                window.clearTimeout(timerId);
                ownerDocument.removeEventListener('pointerdown', handlePointerDown);
                ownerDocument.removeEventListener('click', this.handleClick);
                this.elementRef.nativeElement.removeEventListener('pointerdown', onPointerDownCapture, {
                    capture: true
                });
            });
        });
    }
}
