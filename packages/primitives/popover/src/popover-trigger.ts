import { _IdGenerator } from '@angular/cdk/a11y';
import { NumberInput } from '@angular/cdk/coercion';
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
        '[attr.aria-controls]': 'rootContext()?.contentId',
        '[attr.aria-expanded]': 'isOpen()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.data-state]': 'isOpen() ? "open" : "closed"',
        '[attr.data-popup-open]': 'isOpen() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '[id]': 'triggerId()',
        '(click)': 'handleClick($event)',
        '(pointerenter)': 'handlePointerEnter($event)',
        '(pointerleave)': 'handlePointerLeave($event)',
        '(pointerdown)': 'handlePointerDown()',
        '(pointerup)': 'handlePointerUp()'
    }
})
export class RdxPopoverTrigger {
    private readonly parentRootContext = injectRdxPopoverRootContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Associates this trigger with a detached popover root.
     */
    readonly handle = input<RdxPopoverHandle<any>>();

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
    private readonly generatedId = inject(_IdGenerator).getId('rdx-popover-trigger-');

    constructor() {
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

        this.rootContext()?.closeOnHover(true);
    }

    protected handlePointerDown() {
        this.rootContext()?.setPointerDownOnTrigger(true);
    }

    protected handlePointerUp() {
        this.rootContext()?.setPointerDownOnTrigger(false);
    }
}
