import { _IdGenerator } from '@angular/cdk/a11y';
import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, untracked } from '@angular/core';
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
        '[attr.aria-controls]': 'rootContext()?.contentId',
        '[attr.aria-expanded]': 'isOpen()',
        '[attr.data-state]': 'isOpen() ? "open" : "closed"',
        '[attr.data-popup-open]': 'isOpen() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '[id]': 'triggerId()',
        '(click)': 'handleClick($event)'
    }
})
export class RdxDialogTrigger {
    private readonly parentRootContext = injectRdxDialogRootContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Associates this trigger with a detached dialog root.
     */
    readonly handle = input<RdxDialogHandle<any>>();

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

    private readonly generatedId = inject(_IdGenerator).getId('rdx-dialog-trigger-');
    protected readonly triggerId = computed(() => this.id() ?? this.generatedId);
    protected readonly rootContext = computed(() => this.handle()?.context() ?? this.parentRootContext);
    protected readonly isOpen = computed(
        () => this.rootContext()?.isOpen() === true && this.rootContext()?.trigger() === this.elementRef.nativeElement
    );

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

        if (this.handle()) {
            this.handle()!.toggle(this.triggerId(), event);
        } else {
            this.parentRootContext?.toggle(this.triggerId(), this.elementRef.nativeElement, this.payload(), event);
        }
    }
}
