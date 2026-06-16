import { effect } from '@angular/core';
import { composedContains, getTabbableCandidates } from './utils';

/** Marks the leading / trailing focus-guard spans (Base UI `data-base-ui-focus-guard`). */
export const FOCUS_GUARD_ATTR = 'data-rdx-focus-guard';

/** Saved-tabindex marker used by {@link disableFocusInside} / {@link enableFocusInside}. */
const SAVED_TABINDEX_ATTR = 'data-rdx-tabindex';

/** Visually-hidden, off-flow style for a focus guard / `aria-owns` anchor (Base UI `visuallyHidden`). */
export const FOCUS_GUARD_STYLE: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: '0'
};

/**
 * Creates a visually-hidden, **tabbable** focus-guard `<span>` — the Angular counterpart of Base UI's
 * `FocusGuard`. The portal-focus bridge places one before and one after the portal content so a Tab into
 * (or out of) the portal lands on a guard, which then redirects focus to the right boundary.
 */
export function createFocusGuard(ownerDocument: Document): HTMLSpanElement {
    const guard = ownerDocument.createElement('span');
    guard.setAttribute('tabindex', '0');
    guard.setAttribute('aria-hidden', 'true');
    guard.setAttribute(FOCUS_GUARD_ATTR, '');
    Object.assign(guard.style, FOCUS_GUARD_STYLE);
    return guard;
}

/**
 * Creates a visually-hidden `<span aria-owns="…">` that links the portal node into the trigger's tab /
 * AT order (Base UI's single `aria-owns` anchor). The manager places it next to the trigger.
 */
export function createAriaOwnsAnchor(ownerDocument: Document, portalId: string): HTMLSpanElement {
    const anchor = ownerDocument.createElement('span');
    anchor.setAttribute('aria-owns', portalId);
    Object.assign(anchor.style, FOCUS_GUARD_STYLE);
    return anchor;
}

/**
 * Makes every tabbable descendant of `container` **non-tabbable** (`tabindex="-1"`), saving each one's
 * original tabindex so {@link enableFocusInside} can restore it. Base UI `disableFocusInside`: a
 * non-modal portal keeps its content untabbable until focus is actually inside it, so a Tab from the
 * trigger steps onto the guard instead of jumping into the content.
 */
export function disableFocusInside(container: HTMLElement): void {
    for (const element of getTabbableCandidates(container)) {
        element.setAttribute(SAVED_TABINDEX_ATTR, element.getAttribute('tabindex') ?? '');
        element.setAttribute('tabindex', '-1');
    }
}

/** Restores the tabbability that {@link disableFocusInside} suspended. Base UI `enableFocusInside`. */
export function enableFocusInside(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>(`[${SAVED_TABINDEX_ATTR}]`).forEach((element) => {
        const original = element.getAttribute(SAVED_TABINDEX_ATTR);
        element.removeAttribute(SAVED_TABINDEX_ATTR);
        if (original) {
            element.setAttribute('tabindex', original);
        } else {
            element.removeAttribute('tabindex');
        }
    });
}

/**
 * Whether a focus event crossed the `container` boundary — its `relatedTarget` (the other side of the
 * focus move) is `null` or outside `container` (Base UI `isOutsideEvent`). Shadow-DOM-aware via
 * {@link composedContains}.
 */
export function isOutsideEvent(event: FocusEvent, container: Element): boolean {
    const relatedTarget = event.relatedTarget as Node | null;
    return !relatedTarget || !composedContains(container, relatedTarget);
}

/**
 * The portal-focus bridge's **tabbability toggle** (Base UI `FloatingPortal` capture-phase `onFocus`).
 * While `portalNode` is mounted (and `enabled`), it makes the portal content tabbable **only when focus
 * is inside it**: focus entering from outside re-enables tabbability, focus leaving to outside disables
 * it again. Listens on the **capture** phase so it settles before the focus manager's guards react.
 *
 * Must be called in an injection context. The initial disable-on-mount and the guard-span placement are
 * the manager's responsibility (Phase 1b); this owns only the dynamic in/out toggle.
 */
export function useFocusGuardsTabbability(
    portalNode: () => HTMLElement | null,
    options: { enabled?: () => boolean } = {}
): void {
    const enabled = options.enabled ?? (() => true);
    let focusInsideDisabled = false;

    effect((onCleanup) => {
        const node = portalNode();
        if (!node || !enabled()) {
            return;
        }

        const onFocus = (event: FocusEvent): void => {
            // Only react to focus actually crossing the portal boundary.
            if (!event.relatedTarget || !isOutsideEvent(event, node)) {
                return;
            }
            if (event.type === 'focusin') {
                if (focusInsideDisabled) {
                    enableFocusInside(node);
                    focusInsideDisabled = false;
                }
            } else {
                disableFocusInside(node);
                focusInsideDisabled = true;
            }
        };

        node.addEventListener('focusin', onFocus, true);
        node.addEventListener('focusout', onFocus, true);
        onCleanup(() => {
            node.removeEventListener('focusin', onFocus, true);
            node.removeEventListener('focusout', onFocus, true);
        });
    });
}
