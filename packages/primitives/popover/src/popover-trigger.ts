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
import { injectId, NumberInput, rdxDevError } from '@radix-ng/primitives/core';
import { createRdxTriggerInteraction, useTriggerFocusGuards } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { RdxPopoverHandle } from './popover-handle';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * A button that opens the popover.
 */
@Directive({
    selector: 'button[rdxPopoverTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        type: 'button',
        '[attr.aria-controls]': 'triggerInteraction.ariaControls()',
        '[attr.aria-expanded]': 'triggerInteraction.ariaExpanded()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.data-state]': 'triggerInteraction.dataState()',
        '[attr.data-popup-open]': 'triggerInteraction.dataPopupOpen()',
        '[attr.data-pressed]': 'isPressed() ? "" : undefined',
        '[attr.disabled]': 'triggerInteraction.disabled() ? "" : undefined',
        '[id]': 'triggerId()',
        '(click)': 'handleClick($event)',
        '(pointerenter)': 'handlePointerEnter($event)',
        '(pointerleave)': 'handlePointerLeave($event)',
        '(pointerdown)': 'handlePointerDown($event)',
        '(pointerup)': 'handlePointerUp()',
        '(pointercancel)': 'handlePointerUp()'
    }
})
export class RdxPopoverTrigger {
    private readonly parentRootContext = injectRdxPopoverRootContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Associates this trigger with a detached popover root.
     */
    readonly handle = input<RdxPopoverHandle<unknown>>();

    /**
     * Data associated with this trigger while it is active.
     */
    readonly payload = input<unknown>();

    /**
     * ID used to identify this trigger when opening a detached popover imperatively.
     */
    readonly id = input<string>();

    /**
     * Whether the trigger should ignore user interaction.
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * Whether the popover should also open when this trigger is hovered.
     */
    readonly openOnHover = input(false, { transform: booleanAttribute });

    /**
     * How long to wait before opening the popover on hover, in milliseconds.
     */
    readonly delay = input<number, NumberInput>(300, { transform: numberAttribute });

    /**
     * How long to wait before closing a hover-opened popover, in milliseconds.
     */
    readonly closeDelay = input<number, NumberInput>(0, { transform: numberAttribute });

    protected readonly triggerId = computed(() => this.id() ?? this.generatedId);
    protected readonly rootContext = computed(() => this.handle()?.context() ?? this.parentRootContext);
    protected readonly isOpen = computed(
        () => this.rootContext()?.isOpen() === true && this.rootContext()?.trigger() === this.elementRef.nativeElement
    );
    protected readonly triggerInteraction = createRdxTriggerInteraction({
        trigger: () => this.elementRef.nativeElement,
        activeTrigger: () => this.rootContext()?.trigger(),
        open: () => this.rootContext()?.isOpen() ?? false,
        disabled: () => this.disabled(),
        contentId: () => this.rootContext()?.contentId
    });
    protected readonly isPressed = computed(
        () => this.triggerInteraction.isActive() && this.rootContext()?.openChangeReason() === 'trigger-press'
    );
    private readonly generatedId = injectId('rdx-popover-trigger-');

    constructor() {
        effect(() => {
            if (!this.handle() && !this.parentRootContext) {
                rdxDevError(
                    'popover/trigger-missing-root',
                    '`rdxPopoverTrigger` must be used inside `rdxPopoverRoot` or receive a `handle` connected to a root.',
                    'components/popover'
                );
            }
        });

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

        useTriggerFocusGuards({
            trigger: () => this.elementRef.nativeElement,
            close: (event) => this.rootContext()?.close('focus-out', event),
            beforeContentFocusGuard: () => this.rootContext()?.beforeContentFocusGuard(),
            contentId: () => this.rootContext()?.contentId,
            enabled: () => this.triggerInteraction.isActive(),
            popupElement: () => {
                const contentId = this.rootContext()?.contentId;
                return contentId
                    ? (this.elementRef.nativeElement.ownerDocument.getElementById(contentId) as HTMLElement | null)
                    : null;
            }
        });
    }

    protected handleClick(event: MouseEvent) {
        if (this.disabled()) {
            return;
        }

        // Record whether this open is a touch tap (ADR 0016 §3). `detail === 0` is a keyboard-activated
        // click (no preceding pointerdown), which must read non-touch regardless of the last pointer type.
        const interactionType = this.triggerInteraction.clickInteractionType(event);
        this.rootContext()?.setOpenedByTouch(interactionType === 'touch');
        this.rootContext()?.setTriggerOpenInteractionType(interactionType);
        this.rootContext()?.setPointerDownOnTrigger(false);

        if (this.handle()) {
            this.handle()!.toggle(this.triggerId(), event);
        } else {
            this.parentRootContext?.toggle(this.triggerId(), this.elementRef.nativeElement, this.payload(), event);
        }
    }

    protected handlePointerEnter(event: PointerEvent) {
        const rootContext = this.rootContext();

        if (event.pointerType === 'touch' || !rootContext || this.disabled() || !this.openOnHover()) {
            return;
        }

        rootContext.setHoverDelays(this.delay(), this.closeDelay());
        rootContext.openOnHover(this.elementRef.nativeElement, this.payload(), this.triggerId(), event);
    }

    protected handlePointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch' || !this.openOnHover()) {
            return;
        }

        this.rootContext()?.cancelHoverOpen();
    }

    protected handlePointerDown(event: PointerEvent) {
        this.triggerInteraction.recordPointerDown(event);
        this.rootContext()?.setPointerDownOnTrigger(true);
    }

    protected handlePointerUp() {
        this.rootContext()?.setPointerDownOnTrigger(false);
    }
}
