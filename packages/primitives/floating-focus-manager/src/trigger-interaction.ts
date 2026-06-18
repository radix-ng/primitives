import { computed, effect, Signal, signal } from '@angular/core';
import {
    composedContains,
    createAriaOwnsAnchor,
    createFocusGuard,
    focus,
    FOCUS_GUARD_ATTR,
    getTabbableAfterElement,
    getTabbableBeforeElement,
    isOutsideEvent
} from '@radix-ng/primitives/focus-scope';
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
    close: (event: FocusEvent) => void;
    beforeContentFocusGuard?: () => HTMLElement | null | undefined;
    contentId?: () => string | null | undefined;
    enabled?: () => boolean;
    popupElement?: () => HTMLElement | null | undefined;
}

export interface RdxTriggerFocusGuardAnchorOptions {
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
 * Adds Base UI's trigger-side focus guards for portaled content. The content guards remain owned by
 * `RdxFloatingFocusManager`; these guards bridge tab order from the trigger into the portal and close the
 * popup when focus leaves past either trigger-side boundary.
 */
export function useTriggerFocusGuards(options: RdxTriggerFocusGuardOptions): void {
    const enabled = options.enabled ?? (() => true);

    effect((onCleanup) => {
        if (!enabled()) {
            return;
        }

        const trigger = options.trigger();
        const preGuard = createFocusGuard(trigger.ownerDocument);
        const postGuard = createFocusGuard(trigger.ownerDocument);
        preGuard.setAttribute('data-type', 'outside');
        postGuard.setAttribute('data-type', 'outside');
        const contentId = options.contentId?.();
        const anchor = contentId ? createAriaOwnsAnchor(trigger.ownerDocument, contentId) : null;

        const handlePreGuardFocus = (event: FocusEvent): void => {
            const previousTabbable = getTabbableBeforeElement(preGuard);
            options.close(event);
            focus(previousTabbable);
        };

        const handlePostGuardFocus = (event: FocusEvent): void => {
            const popup = options.popupElement?.() ?? null;
            const beforeContentGuard = options.beforeContentFocusGuard?.() ?? null;

            if (popup && beforeContentGuard && isOutsideEvent(event, popup)) {
                focus(beforeContentGuard);
                return;
            }

            let nextTabbable = getTabbableAfterElement(postGuard);
            while (
                nextTabbable &&
                (nextTabbable.hasAttribute(FOCUS_GUARD_ATTR) || (popup && composedContains(popup, nextTabbable)))
            ) {
                const previous = nextTabbable;
                nextTabbable = getTabbableAfterElement(nextTabbable);
                if (nextTabbable === previous) {
                    break;
                }
            }

            options.close(event);
            focus(nextTabbable);
        };

        preGuard.addEventListener('focus', handlePreGuardFocus);
        postGuard.addEventListener('focus', handlePostGuardFocus);

        trigger.insertAdjacentElement('beforebegin', preGuard);
        if (anchor) {
            trigger.insertAdjacentElement('afterend', anchor);
            anchor.insertAdjacentElement('afterend', postGuard);
        } else {
            trigger.insertAdjacentElement('afterend', postGuard);
        }

        onCleanup(() => {
            preGuard.removeEventListener('focus', handlePreGuardFocus);
            postGuard.removeEventListener('focus', handlePostGuardFocus);
            preGuard.remove();
            postGuard.remove();
            anchor?.remove();
        });
    });
}

/**
 * Backwards-compatible aria-owns-only bridge for modal popups that do not need trigger-side tab guards.
 */
export function useTriggerFocusGuardAnchor(options: RdxTriggerFocusGuardAnchorOptions): void {
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
