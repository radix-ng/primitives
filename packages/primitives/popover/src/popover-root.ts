import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, effect, inject, input, model, signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';

const context = () => {
    const root = inject(RdxPopoverRoot);

    return {
        contentId: root.contentId,
        descriptionId: root.descriptionId.asReadonly(),
        isOpen: root.open,
        titleId: root.titleId.asReadonly(),
        trigger: root.trigger.asReadonly(),
        isPointerDownOnTrigger: root.isPointerDownOnTrigger.asReadonly(),
        close: () => root.close(),
        open: () => root.show(),
        setDescriptionId: (id: string | undefined) => root.descriptionId.set(id),
        setTitleId: (id: string | undefined) => root.titleId.set(id),
        setTrigger: (trigger: HTMLElement | undefined) => root.trigger.set(trigger),
        setPointerDownOnTrigger: (pointerDown: boolean) => root.isPointerDownOnTrigger.set(pointerDown),
        toggle: () => root.toggle()
    };
};

export type RdxPopoverRootContext = ReturnType<typeof context>;

export const [injectRdxPopoverRootContext, provideRdxPopoverRootContext] =
    createContext<RdxPopoverRootContext>('RdxPopoverRootContext');

/**
 * Groups all parts of the popover.
 */
@Directive({
    selector: '[rdxPopoverRoot]',
    exportAs: 'rdxPopoverRoot',
    providers: [provideRdxPopoverRootContext(context)],
    hostDirectives: [RdxPopper]
})
export class RdxPopoverRoot {
    private readonly idGenerator = inject(_IdGenerator);
    private hasAppliedDefaultOpen = false;

    /**
     * Whether the popover is currently open.
     */
    readonly open = model(false);

    /**
     * Whether the popover is initially open.
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly contentId = this.idGenerator.getId('rdx-popover-content-');
    readonly descriptionId = signal<string | undefined>(undefined);
    readonly titleId = signal<string | undefined>(undefined);
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly isPointerDownOnTrigger = signal(false);

    readonly state = computed(() => (this.open() ? 'open' : 'closed'));

    constructor() {
        effect(() => {
            const defaultOpen = this.defaultOpen();

            if (!this.hasAppliedDefaultOpen) {
                this.hasAppliedDefaultOpen = true;
                this.open.set(defaultOpen);
            }
        });
    }

    show() {
        this.open.set(true);
    }

    close() {
        this.open.set(false);
    }

    toggle() {
        this.open.update((open) => !open);
    }
}
