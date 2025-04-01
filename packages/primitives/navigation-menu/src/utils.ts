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
export function getOpenState(open: boolean): 'open' | 'closed' {
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
 */
export function focusFirst(candidates: HTMLElement[], preventScroll = false): boolean {
    const prevFocusedElement = document.activeElement;
    return candidates.some((candidate) => {
        // if focus is already where we want it, do nothing
        if (candidate === prevFocusedElement) return true;

        candidate.focus({ preventScroll });
        return document.activeElement !== prevFocusedElement;
    });
}

/**
 * Get all tabbable candidates in a container
 */
export function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
    const nodes: HTMLElement[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node: any) => {
            const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
            if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
            return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
    });

    while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
    return nodes;
}

/**
 * Remove elements from tab order and return a function to restore them
 */
export function removeFromTabOrder(candidates: HTMLElement[]): () => void {
    candidates.forEach((candidate) => {
        candidate.dataset['tabindex'] = candidate.getAttribute('tabindex') || '';
        candidate.setAttribute('tabindex', '-1');
    });

    return () => {
        candidates.forEach((candidate) => {
            const prevTabIndex = candidate.dataset['tabindex'] as string;
            candidate.setAttribute('tabindex', prevTabIndex);
        });
    };
}

/**
 * Wrap array around itself at given start index
 */
export function wrapArray<T>(array: T[], startIndex: number): T[] {
    return array.map((_, index) => array[(startIndex + index) % array.length]);
}
