import { DOCUMENT } from '@angular/common';
import {
    computed,
    contentChild,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    OnInit,
    output,
    signal,
    untracked,
    ViewContainerRef
} from '@angular/core';
import { RdxPopoverArrowToken } from './popover-arrow.token';
import { RdxPopoverContentDirective } from './popover-content.directive';
import { RdxPopoverRootToken } from './popover-root.token';
import { RdxPopoverTriggerDirective } from './popover-trigger.directive';
import { RdxPopoverState } from './popover.types';

@Directive({
    selector: '[rdxPopoverRoot]',
    standalone: true,
    providers: [
        {
            provide: RdxPopoverRootToken,
            useExisting: forwardRef(() => RdxPopoverRootDirective)
        }
    ],
    exportAs: 'rdxPopoverRoot'
})
export class RdxPopoverRootDirective implements OnInit {
    /**
     * The open state of the popover when it is initially rendered. Use when you do not need to control its open state.
     */
    readonly defaultOpen = input<boolean>(false);
    /**
     * The controlled open state of the popover. Must be used in conjunction with onOpenChange.
     */
    readonly open = input<boolean | undefined>();

    /**
     * Event handler called when the open state of the popover changes.
     */
    readonly onOpenChange = output<boolean>();

    /** @ignore */
    readonly popoverContentDirective = contentChild.required(RdxPopoverContentDirective);
    /** @ignore */
    readonly popoverTriggerDirective = contentChild.required(RdxPopoverTriggerDirective);
    /** @ignore */
    readonly popoverArrowDirective = contentChild(RdxPopoverArrowToken);

    /** @ignore */
    readonly viewContainerRef = inject(ViewContainerRef);
    /** @ignore */
    private readonly document = inject(DOCUMENT);

    /** @ignore */
    readonly isOpen = signal<boolean>(this.defaultOpen());
    /** @ignore */
    readonly state = computed<RdxPopoverState>(() => {
        const currentIsOpen = this.isOpen();
        if (currentIsOpen) {
            return 'open';
        }
        return 'closed';
    });

    /** @ignore */
    private isControlledExternally = computed(() => signal(this.open() !== void 0));

    constructor() {
        this.onOpenChangeEffect();
        this.onIsOpenChangeEffect();
    }

    /** @ignore */
    ngOnInit(): void {
        if (this.defaultOpen()) {
            this.handleOpen();
        }
    }

    /** @ignore */
    controlledExternally() {
        return this.isControlledExternally().asReadonly();
    }

    /** @ignore */
    handleOpen(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.setOpen(true);
    }

    /** @ignore */
    handleClose(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.setOpen(false);
    }

    /** @ignore */
    handleToggle(): void {
        if (this.isControlledExternally()()) {
            return;
        }
        this.isOpen() ? this.handleClose() : this.handleOpen();
    }

    /** @ignore */
    private setOpen(open = false): void {
        if (open) {
            this.document.dispatchEvent(new CustomEvent('popover.open'));
        }

        this.isOpen.set(open);
        this.onOpenChange.emit(open);
    }

    /** @ignore */
    private show(): void {
        this.popoverContentDirective().show();
    }

    /** @ignore */
    private hide(): void {
        this.popoverContentDirective().hide();
    }

    /** @ignore */
    private onIsOpenChangeEffect() {
        effect(() => {
            const isOpen = this.isOpen();

            untracked(() => {
                if (isOpen) {
                    this.show();
                } else {
                    this.hide();
                }
            });
        });
    }

    /** @ignore */
    private onOpenChangeEffect() {
        effect(() => {
            const currentOpen = this.open();

            untracked(() => {
                this.isControlledExternally().set(currentOpen !== void 0);
                if (this.isControlledExternally()()) {
                    this.setOpen(currentOpen);
                }
            });
        });
    }
}
