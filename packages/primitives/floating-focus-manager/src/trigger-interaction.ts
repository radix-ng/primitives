import { computed, effect, Signal, signal } from '@angular/core';
import { createAriaOwnsAnchor } from '@radix-ng/primitives/focus-scope';
import { getInteractionTypeFromEvent, RdxInteractionType } from './floating-focus-manager';

export interface RdxTriggerInteractionOptions {
    trigger: () => HTMLElement;
    open: () => boolean;
    activeTrigger?: () => HTMLElement | null | undefined;
    disabled?: () => boolean;
    contentId?: () => string | null | undefined;
}

export interface RdxTriggerInteraction {
    readonly lastPointerType: Signal<string>;
    readonly isActive: Signal<boolean>;
    readonly isInactive: Signal<boolean>;
    readonly dataState: Signal<'open' | 'closed'>;
    readonly dataPopupOpen: Signal<'' | undefined>;
    readonly ariaControls: Signal<string | undefined>;
    readonly ariaExpanded: Signal<boolean>;
    readonly disabled: Signal<boolean>;
    recordPointerDown: (event: PointerEvent) => void;
    clickInteractionType: (event: MouseEvent) => RdxInteractionType;
}

export interface RdxTriggerFocusGuardOptions {
    trigger: () => HTMLElement;
    contentId: () => string | null | undefined;
    enabled?: () => boolean;
}

/**
 * Shared trigger state for floating primitives. It intentionally stays small: each primitive still owns
 * its open/close business rules, while this layer normalizes active-trigger state and the open method
 * signal that must be captured before the popup/focus manager mounts.
 */
export function createRdxTriggerInteraction(options: RdxTriggerInteractionOptions): RdxTriggerInteraction {
    const lastPointerType = signal('');
    const activeTrigger = options.activeTrigger ?? (() => options.trigger());
    const disabled = computed(() => options.disabled?.() ?? false);
    const isActive = computed(() => options.open() && activeTrigger() === options.trigger());
    const dataState = computed(() => (options.open() ? 'open' : 'closed'));
    const dataPopupOpen = computed(() => (isActive() ? '' : undefined));
    const ariaControls = computed(() => (isActive() ? (options.contentId?.() ?? undefined) : undefined));
    const ariaExpanded = computed(() => isActive());

    return {
        lastPointerType: lastPointerType.asReadonly(),
        isActive,
        isInactive: computed(() => !isActive()),
        dataState,
        dataPopupOpen,
        ariaControls,
        ariaExpanded,
        disabled,
        recordPointerDown: (event: PointerEvent): void => {
            lastPointerType.set(event.pointerType);
        },
        clickInteractionType: (event: MouseEvent): RdxInteractionType => {
            if (event.detail !== 0 && lastPointerType() === 'touch') {
                return 'touch';
            }
            return getInteractionTypeFromEvent(event);
        }
    };
}

/**
 * Adds Base UI's trigger-side `aria-owns` bridge for portaled content. The content guards remain owned by
 * `RdxFloatingFocusManager`; this only links the active trigger into the portal's accessibility order.
 */
export function useTriggerFocusGuardAnchor(options: RdxTriggerFocusGuardOptions): void {
    const enabled = options.enabled ?? (() => true);

    effect((onCleanup) => {
        const contentId = options.contentId();
        if (!enabled() || !contentId) {
            return;
        }

        const trigger = options.trigger();
        const anchor = createAriaOwnsAnchor(trigger.ownerDocument, contentId);
        trigger.insertAdjacentElement('afterend', anchor);
        onCleanup(() => anchor.remove());
    });
}
