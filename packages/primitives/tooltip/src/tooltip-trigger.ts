import { injectRdxTooltipContext } from './tooltip';
import { RdxTooltipHandle } from './tooltip-handle';
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
import { BooleanInput, injectId, NumberInput } from '@radix-ng/primitives/core';
import { createRdxTriggerInteraction } from '@radix-ng/primitives/floating-focus-manager';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';

const TOOLTIP_TRIGGER_ATTR = 'data-rdx-tooltip-trigger';

function getTargetElement(event: Event): Element | null {
    if ('composedPath' in event) {
        for (const target of event.composedPath()) {
            if (target instanceof Element) {
                return target;
            }
        }
    }

    return event.target instanceof Element ? event.target : null;
}

function closestEnabledTooltipTrigger(element: Element | null): Element | null {
    let current = element;

    while (current) {
        if (current.hasAttribute(TOOLTIP_TRIGGER_ATTR)) {
            return current;
        }

        if (current.parentElement) {
            current = current.parentElement;
            continue;
        }

        const root = current.getRootNode();
        current = 'host' in root && root.host instanceof Element ? root.host : null;
    }

    return null;
}

function isMouseLikePointerType(pointerType: string | undefined): boolean {
    return pointerType !== 'touch';
}

@Directive({
    selector: '[rdxTooltipTrigger]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        type: 'button',
        'data-grace-area-trigger': "''",
        '[id]': 'triggerId()',
        '[attr.aria-describedby]': 'isOpen() ? rootContext()?.contentId : undefined',
        '[attr.data-popup-open]': 'triggerInteraction.dataPopupOpen()',
        '[attr.data-trigger-disabled]': 'triggerInteraction.disabled() ? "" : undefined',
        '[attr.data-rdx-tooltip-trigger]': 'isDisabled() ? undefined : ""',
        '(pointerenter)': 'handlePointerEnter($event)',
        '(pointermove)': 'handlePointerMove($event)',
        '(pointerleave)': 'handlePointerLeave()',
        '(mouseover)': 'handleMouseOver($event)',
        '(mouseleave)': 'handleMouseLeave()',
        '(pointerdown)': 'handlePointerDown($event)',
        '(focus)': 'handleFocus($event)',
        '(blur)': 'handleBlur($event)',
        '(click)': 'handleClick($event)'
    }
})
export class RdxTooltipTrigger {
    private readonly parentRootContext = injectRdxTooltipContext(true);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly generatedId = injectId('rdx-tooltip-trigger-');

    /**
     * Associates this trigger with a detached tooltip root.
     */
    readonly handle = input<RdxTooltipHandle<unknown>>();

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
    protected readonly triggerInteraction = createRdxTriggerInteraction({
        trigger: () => this.elementRef.nativeElement,
        activeTrigger: () => this.rootContext()?.trigger(),
        open: () => this.rootContext()?.isOpen() ?? false,
        disabled: () => this.isDisabled(),
        contentId: () => this.rootContext()?.contentId
    });

    private readonly isPointerDown = signal(false);
    private readonly hasPointerMoveOpened = signal(false);
    private readonly isNestedTriggerHovered = signal(false);
    private pointerType: string | undefined;

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

    protected handleFocus(event: FocusEvent) {
        const rootContext = this.rootContext();

        if (!rootContext || this.isDisabled() || this.isPointerDown()) {
            return;
        }

        rootContext.setDelays(this.delay(), this.closeDelay());
        rootContext.open(this.elementRef.nativeElement, this.payload(), event);
    }

    protected handleBlur(event: FocusEvent) {
        this.rootContext()?.closeDelayed(event);
    }

    protected handleClick(event: MouseEvent) {
        const rootContext = this.rootContext();

        if (rootContext?.isOpen() && this.closeOnClick()) {
            rootContext.close('trigger-press', event);
            return;
        }

        if (rootContext && this.closeOnClick()) {
            rootContext.cancelPendingOpen();
        }
    }

    protected handlePointerEnter(event: PointerEvent) {
        this.pointerType = event.pointerType;
    }

    protected handlePointerMove(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        const rootContext = this.rootContext();

        if (!rootContext || this.isDisabled()) {
            return;
        }

        this.pointerType = event.pointerType;
        if (this.detectNestedTriggerHover(getTargetElement(event))) {
            return;
        }

        if (rootContext.trackCursorAxis() !== 'none') {
            rootContext.setCursorPosition({ x: event.clientX, y: event.clientY });
        }

        if (!this.hasPointerMoveOpened()) {
            rootContext.setDelays(this.delay(), this.closeDelay());
            rootContext.onTriggerEnter(this.elementRef.nativeElement, this.payload(), event);
            this.hasPointerMoveOpened.set(true);
        }
    }

    protected handlePointerLeave() {
        this.rootContext()?.onTriggerLeave();
        this.hasPointerMoveOpened.set(false);
    }

    protected handleMouseOver(event: MouseEvent) {
        const wasNestedTriggerHovered = this.isNestedTriggerHovered();
        const target = getTargetElement(event);
        const nestedTriggerHovered = this.detectNestedTriggerHover(target);
        const trigger = this.elementRef.nativeElement;
        const targetInsideTrigger = target ? trigger.contains(target) : false;
        const rootContext = this.rootContext();

        if (!rootContext) {
            return;
        }

        if (nestedTriggerHovered && rootContext.isOpen() && rootContext.openChangeReason() === 'trigger-hover') {
            rootContext.closeHoverOpen();
            return;
        }

        if (
            wasNestedTriggerHovered &&
            !nestedTriggerHovered &&
            targetInsideTrigger &&
            !this.isDisabled() &&
            !rootContext.isOpen() &&
            isMouseLikePointerType(this.pointerType)
        ) {
            rootContext.setDelays(this.delay(), this.closeDelay());
            rootContext.onTriggerEnter(trigger, this.payload(), event);
            this.hasPointerMoveOpened.set(true);
        }
    }

    protected handleMouseLeave() {
        this.isNestedTriggerHovered.set(false);
        this.pointerType = undefined;
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
        this.triggerInteraction.recordPointerDown(event);
        this.pointerType = event.pointerType;
        if (this.closeOnClick() && !this.rootContext()?.isOpen()) {
            this.rootContext()?.cancelPendingOpen();
        }

        const handlePointerUp = () => {
            setTimeout(() => this.isPointerDown.set(false), 1);
        };

        document.addEventListener('pointerup', handlePointerUp, { once: true });
    }

    private detectNestedTriggerHover(target: Element | null): boolean {
        const trigger = this.elementRef.nativeElement;
        const nearestTrigger = closestEnabledTooltipTrigger(target);
        const nestedTriggerHovered =
            nearestTrigger !== null && nearestTrigger !== trigger && trigger.contains(nearestTrigger);

        this.isNestedTriggerHovered.set(nestedTriggerHovered);
        if (nestedTriggerHovered) {
            this.rootContext()?.cancelPendingOpen();
        }

        return nestedTriggerHovered;
    }
}
