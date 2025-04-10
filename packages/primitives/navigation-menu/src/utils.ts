export type NavigationMenuOrientation = 'horizontal' | 'vertical';
export type NavigationMenuDirection = 'ltr' | 'rtl';
export type MotionAttribute = 'to-start' | 'to-end' | 'from-start' | 'from-end';

export const ROOT_CONTENT_DISMISS = 'navigationMenu.rootContentDismiss';

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

/**
 * Get the open state for data-state attribute
 */
export function getOpenStateLabel(open: boolean): 'open' | 'closed' {
    return open ? 'open' : 'closed';
}

/**
 * Create a trigger ID from base ID and value
 */
export function makeTriggerId(baseId: string, value: string): string {
    return `${baseId}-trigger-${value}`;
}

/**
 * Create a content ID from base ID and value
 */
export function makeContentId(baseId: string, value: string): string {
    return `${baseId}-content-${value}`;
}

/**
 * Get the motion attribute for animations
 */
export function getMotionAttribute(
    currentValue: string,
    previousValue: string,
    itemValue: string,
    itemValues: string[],
    dir: NavigationMenuDirection
): MotionAttribute | null {
    // reverse values in RTL
    const values = dir === 'rtl' ? [...itemValues].reverse() : itemValues;

    const currentIndex = values.indexOf(currentValue);
    const prevIndex = values.indexOf(previousValue);
    const isSelected = itemValue === currentValue;
    const wasSelected = prevIndex === values.indexOf(itemValue);

    // only update selected and last selected content
    if (!isSelected && !wasSelected) return null;

    // don't provide direction on initial open
    if (currentIndex !== -1 && prevIndex !== -1) {
        // if moving to this item from another
        if (isSelected && prevIndex !== -1) {
            return currentIndex > prevIndex ? 'from-end' : 'from-start';
        }
        // if leaving this item for another
        if (wasSelected && currentIndex !== -1) {
            return currentIndex > prevIndex ? 'to-start' : 'to-end';
        }
    }

    // otherwise entering/leaving the list entirely
    return isSelected ? 'from-start' : 'from-end';
}

/**
 * Focus the first element in a list of candidates
 * @param candidates Array of elements that can receive focus
 * @param preventScroll Whether to prevent scrolling when focusing
 * @param activateKeyboardNav Whether to dispatch a dummy keydown event to activate keyboard navigation handlers
 * @returns Whether focus was successfully moved
 */
export function focusFirst(candidates: HTMLElement[], preventScroll = false, activateKeyboardNav = true): boolean {
    const prevFocusedElement = document.activeElement;

    // sort candidates by tabindex to ensure proper order
    const sortedCandidates = [...candidates].sort((a, b) => {
        const aIndex = a.tabIndex || 0;
        const bIndex = b.tabIndex || 0;
        return aIndex - bIndex;
    });

    const success = sortedCandidates.some((candidate) => {
        // if focus is already where we want it, do nothing
        if (candidate === prevFocusedElement) return true;

        try {
            candidate.focus({ preventScroll });
            return document.activeElement !== prevFocusedElement;
        } catch (e) {
            console.error('Error focusing element:', e);
            return false;
        }
    });

    // if focus was moved successfully and we want to activate keyboard navigation,
    // dispatch a dummy keypress to ensure keyboard handlers are activated
    if (success && activateKeyboardNav && document.activeElement !== prevFocusedElement) {
        try {
            // dispatch a no-op keydown event to activate any keyboard handlers
            document.activeElement?.dispatchEvent(
                new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Tab',
                    code: 'Tab'
                })
            );
        } catch (e) {
            console.error('Error dispatching keyboard event:', e);
        }
    }

    return success;
}

/**
 * Get all tabbable candidates in a container
 */
export function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
    if (!container || !container.querySelectorAll) return [];

    const TABBABLE_SELECTOR =
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), ' +
        '[contenteditable="true"]:not([tabindex="-1"])';

    // use querySelector for better browser support
    const elements = Array.from(container.querySelectorAll(TABBABLE_SELECTOR)) as HTMLElement[];

    // filter out elements that are hidden, have display:none, etc.
    return elements.filter((element) => {
        if (element.tabIndex < 0) return false;
        if (element.hasAttribute('disabled')) return false;
        if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') return false;

        // Check if element or any parent is hidden
        let current: HTMLElement | null = element;
        while (current) {
            const style = window.getComputedStyle(current);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }
            current = current.parentElement;
        }

        return true;
    });
}

/**
 * Remove elements from tab order and return a function to restore them
 */
export function removeFromTabOrder(candidates: HTMLElement[]): () => void {
    const originalValues = new Map<HTMLElement, string | null>();

    candidates.forEach((candidate) => {
        // Store original tabindex
        originalValues.set(candidate, candidate.getAttribute('tabindex'));

        // Set to -1 to remove from tab order
        candidate.setAttribute('tabindex', '-1');
    });

    // Return restore function
    return () => {
        candidates.forEach((candidate) => {
            const originalValue = originalValues.get(candidate);
            if (originalValue == null) {
                candidate.removeAttribute('tabindex');
            } else {
                candidate.setAttribute('tabindex', originalValue);
            }
        });
    };
}

/**
 * Wrap array around itself at given start index
 */
export function wrapArray<T>(array: T[], startIndex: number): T[] {
    return array.map((_, index) => array[(startIndex + index) % array.length]);
}
