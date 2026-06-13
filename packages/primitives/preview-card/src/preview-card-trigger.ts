import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    numberAttribute,
    untracked
} from '@angular/core';
import { injectId, NumberInput, rdxCheckTriggerElement } from '@radix-ng/primitives/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { RdxPreviewCardHandle } from './preview-card-handle';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * A link or element that opens the preview card.
 */
@Directive({
    selector: '[rdxPreviewCardTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        '[attr.aria-controls]': 'rootContext()?.contentId',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.aria-expanded]': 'isOpen()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-state]': 'isOpen() ? "open" : "closed"',
        '[attr.data-popup-open]': 'isOpen() ? "" : undefined',
        '[attr.data-pressed]': 'isPressed() ? "" : undefined',
        '[id]': 'triggerId()',
        '(click)': 'handleClick($event)',
        '(pointerenter)': 'handlePointerEnter($event)',
        '(pointerleave)': 'handlePointerLeave($event)',
        '(focus)': 'handleFocus($event)',
        '(blur)': 'handleBlur($event)',
        '(pointerdown)': 'handlePointerDown()',
        '(pointerup)': 'handlePointerUp()',
        '(pointercancel)': 'handlePointerUp()'
    }
})
export class RdxPreviewCardTrigger {
    private readonly parentRootContext = injectRdxPreviewCardRootContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Associates this trigger with a detached preview-card root.
     */
    readonly handle = input<RdxPreviewCardHandle<any>>();

    /**
     * Data associated with this trigger while it is active.
     */
    readonly payload = input<unknown>();

    /**
     * ID used to identify this trigger when opening a detached preview-card imperatively.
     */
    readonly id = input<string>();

    /**
     * Whether the trigger should ignore user interaction.
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * How long to wait before opening the preview-card on hover, in milliseconds.
     */
    readonly delay = input<number, NumberInput>(600, { transform: numberAttribute });

    /**
     * How long to wait before closing a hover-opened preview-card, in milliseconds.
     */
    readonly closeDelay = input<number, NumberInput>(300, { transform: numberAttribute });

    protected readonly triggerId = computed(() => this.id() ?? this.generatedId);
    protected readonly rootContext = computed(() => this.handle()?.context() ?? this.parentRootContext);
    protected readonly isOpen = computed(
        () => this.rootContext()?.isOpen() === true && this.rootContext()?.trigger() === this.elementRef.nativeElement
    );
    protected readonly isPressed = computed(
        () => this.isOpen() && this.rootContext()?.openChangeReason() === 'trigger-press'
    );
    private readonly generatedId = injectId('rdx-preview-card-trigger-');

    constructor() {
        rdxCheckTriggerElement('rdxPreviewCardTrigger', 'preview-card/trigger-element', 'components/preview-card');

        effect((onCleanup) => {
            const handle = this.handle();

            if (handle) {
                onCleanup(
                    untracked(() =>
                        handle.registerTrigger(this.triggerId(), this.elementRef.nativeElement, () => this.payload())
                    )
                );
            } else if (this.parentRootContext) {
                onCleanup(
                    untracked(() =>
                        this.parentRootContext!.registerTrigger(this.triggerId(), this.elementRef.nativeElement, () =>
                            this.payload()
                        )
                    )
                );
            }
        });
    }

    protected handleClick(event: MouseEvent) {
        if (this.disabled()) {
            return;
        }

        this.rootContext()?.setPointerDownOnTrigger(false);

        this.rootContext()?.close('trigger-press', event);
    }

    protected handlePointerEnter(event: PointerEvent) {
        const rootContext = this.rootContext();

        if (event.pointerType === 'touch' || !rootContext || this.disabled()) {
            return;
        }

        rootContext.setHoverDelays(this.delay(), this.closeDelay());
        rootContext.openWithDelay(
            this.elementRef.nativeElement,
            this.payload(),
            this.triggerId(),
            'trigger-hover',
            event
        );
    }

    protected handlePointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext()?.cancelHoverOpen();
    }

    protected handleFocus(event: FocusEvent) {
        const rootContext = this.rootContext();

        if (!rootContext || this.disabled()) {
            return;
        }

        rootContext.setHoverDelays(this.delay(), this.closeDelay());
        rootContext.openWithDelay(
            this.elementRef.nativeElement,
            this.payload(),
            this.triggerId(),
            'trigger-focus',
            event
        );
    }

    protected handleBlur(event: FocusEvent) {
        this.rootContext()?.close('trigger-focus', event);
    }

    protected handlePointerDown() {
        this.rootContext()?.setPointerDownOnTrigger(true);
    }

    protected handlePointerUp() {
        this.rootContext()?.setPointerDownOnTrigger(false);
    }
}
