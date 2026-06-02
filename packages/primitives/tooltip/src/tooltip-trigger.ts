import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    numberAttribute,
    signal,
    untracked
} from '@angular/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectRdxTooltipContext } from './tooltip';
import { RdxTooltipHandle } from './tooltip-handle';

@Directive({
    selector: '[rdxTooltipTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        type: 'button',
        'data-grace-area-trigger': "''",
        '[id]': 'triggerId()',
        '[attr.aria-describedby]': 'isOpen() ? rootContext()?.contentId : undefined',
        '[attr.data-popup-open]': 'isOpen() ? "" : undefined',
        '[attr.data-trigger-disabled]': 'isDisabled() ? "" : undefined',
        '(pointermove)': 'handlePointerMove($event)',
        '(pointerleave)': 'handlePointerLeave()',
        '(pointerdown)': 'handlePointerDown($event)',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',
        '(click)': 'handleClick()'
    }
})
export class RdxTooltipTrigger {
    private readonly parentRootContext = injectRdxTooltipContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly generatedId = inject(_IdGenerator).getId('rdx-tooltip-trigger-');

    /**
     * Associates this trigger with a detached tooltip root.
     */
    readonly handle = input<RdxTooltipHandle<any>>();

    /**
     * Data associated with this trigger while it is active.
     */
    readonly payload = input<unknown>();

    /**
     * ID used to identify this trigger when opening a detached tooltip imperatively.
     */
    readonly id = input<string>();

    /**
     * Whether the tooltip should close when the trigger is clicked.
     * @defaultValue true
     */
    readonly closeOnClick = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Whether this trigger is disabled. A disabled trigger never opens the tooltip.
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Overrides the open delay (ms) for this trigger. Falls back to the root/provider/global delay.
     */
    readonly delay = input<number | undefined, NumberInput | undefined>(undefined, {
        transform: (value) => (value == null ? undefined : numberAttribute(value))
    });

    /**
     * Overrides the close delay (ms) for this trigger. Falls back to the root/provider/global delay.
     */
    readonly closeDelay = input<number | undefined, NumberInput | undefined>(undefined, {
        transform: (value) => (value == null ? undefined : numberAttribute(value))
    });

    readonly userOnPointerDown = input<(event: PointerEvent) => void | boolean | Promise<void | boolean> | undefined>(
        undefined,
        { alias: 'rdxOnPointerDown' }
    );

    protected readonly triggerId = computed(() => this.id() ?? this.generatedId);
    protected readonly rootContext = computed(() => this.handle()?.context() ?? this.parentRootContext);

    /** Disabled if either the root or this trigger is disabled. */
    protected readonly isDisabled = computed(() => (this.rootContext()?.disabled() ?? false) || this.disabled());

    /** Whether this specific trigger is the active anchor of an open tooltip. */
    protected readonly isOpen = computed(
        () => this.rootContext()?.isOpen() === true && this.rootContext()?.trigger() === this.elementRef.nativeElement
    );

    private readonly isPointerDown = signal(false);
    private readonly hasPointerMoveOpened = signal(false);

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
                onCleanup(untracked(() => this.parentRootContext!.registerTrigger(this.elementRef.nativeElement)));
            }
        });
    }

    protected handleFocus() {
        const rootContext = this.rootContext();

        if (!rootContext || this.isDisabled() || this.isPointerDown()) {
            return;
        }

        rootContext.setDelays(this.delay(), this.closeDelay());
        rootContext.open(this.elementRef.nativeElement, this.payload());
    }

    protected handleBlur() {
        this.rootContext()?.closeDelayed();
    }

    protected handleClick() {
        const rootContext = this.rootContext();

        if (rootContext?.isOpen() && this.closeOnClick()) {
            rootContext.close();
        }
    }

    protected handlePointerMove(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        const rootContext = this.rootContext();

        if (!rootContext || this.isDisabled()) {
            return;
        }

        if (rootContext.trackCursorAxis() !== 'none') {
            rootContext.setCursorPosition({ x: event.clientX, y: event.clientY });
        }

        if (!this.hasPointerMoveOpened()) {
            rootContext.setDelays(this.delay(), this.closeDelay());
            rootContext.onTriggerEnter(this.elementRef.nativeElement, this.payload());
            this.hasPointerMoveOpened.set(true);
        }
    }

    protected handlePointerLeave() {
        this.rootContext()?.onTriggerLeave();
        this.hasPointerMoveOpened.set(false);
    }

    protected async handlePointerDown(event: PointerEvent) {
        const user = this.userOnPointerDown();
        let result: unknown;

        if (user) {
            result = user(event);
            if (result instanceof Promise) result = await result;
        }

        if (event.defaultPrevented || result === false) {
            return;
        }

        this.isPointerDown.set(true);

        const handlePointerUp = () => {
            setTimeout(() => this.isPointerDown.set(false), 1);
        };

        document.addEventListener('pointerup', handlePointerUp, { once: true });
    }
}
