import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, untracked } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { createRdxTriggerInteraction, useTriggerFocusGuardAnchor } from '@radix-ng/primitives/floating-focus-manager';
import { RdxDialogHandle } from './dialog-handle';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * A button that opens the dialog.
 */
@Directive({
    selector: 'button[rdxDialogTrigger]',
    exportAs: 'rdxDialogTrigger',
    host: {
        type: 'button',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-controls]': 'triggerInteraction.ariaControls()',
        '[attr.aria-expanded]': 'triggerInteraction.ariaExpanded()',
        '[attr.data-popup-open]': 'triggerInteraction.dataPopupOpen()',
        '[attr.disabled]': 'triggerInteraction.disabled() ? "" : undefined',
        '[id]': 'triggerId()',
        '(click)': 'handleClick($event)',
        '(pointerdown)': 'handlePointerDown($event)'
    }
})
export class RdxDialogTrigger {
    private readonly parentRootContext = injectRdxDialogRootContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Associates this trigger with a detached dialog root.
     */
    readonly handle = input<RdxDialogHandle<unknown>>();

    /**
     * Data associated with this trigger while it is active.
     */
    readonly payload = input<unknown>();

    /**
     * ID used to identify this trigger when opening a detached or controlled dialog.
     */
    readonly id = input<string>();

    /**
     * Whether the trigger should ignore user interaction.
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    private readonly generatedId = injectId('rdx-dialog-trigger-');
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

        useTriggerFocusGuardAnchor({
            trigger: () => this.elementRef.nativeElement,
            contentId: () => this.rootContext()?.contentId,
            enabled: () => this.triggerInteraction.isActive()
        });
    }

    protected handleClick(event: MouseEvent) {
        if (this.disabled()) {
            return;
        }

        this.rootContext()?.setTriggerOpenInteractionType(this.triggerInteraction.clickInteractionType(event));

        if (this.handle()) {
            this.handle()!.toggle(this.triggerId(), event);
        } else {
            this.parentRootContext?.toggle(this.triggerId(), this.elementRef.nativeElement, this.payload(), event);
        }
    }

    protected handlePointerDown(event: PointerEvent) {
        this.triggerInteraction.recordPointerDown(event);
    }
}
