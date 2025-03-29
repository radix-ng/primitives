export type NavigationMenuOrientation = 'horizontal' | 'vertical';
export type NavigationMenuDirection = 'ltr' | 'rtl';

export interface ContentMountData {
    contentRef: any;
    value: string;
    forceMount?: boolean;
    props: any;
}

export function getOpenState(open: boolean): 'open' | 'closed' {
    return open ? 'open' : 'closed';
}

export function makeTriggerId(baseId: string, value: string): string {
    return `${baseId}-trigger-${value}`;
}

export function makeContentId(baseId: string, value: string): string {
    return `${baseId}-content-${value}`;
}

// CSS selectors needed for indicator
export function calculateIndicatorPosition(
    activeItem: HTMLElement | null,
    orientation: NavigationMenuOrientation
): { size: number; offset: number } | null {
    if (!activeItem) return null;

    return {
        size: orientation === 'horizontal' ? activeItem.offsetWidth : activeItem.offsetHeight,
        offset: orientation === 'horizontal' ? activeItem.offsetLeft : activeItem.offsetTop
    };
}

export type MotionAttribute = 'to-start' | 'to-end' | 'from-start' | 'from-end';

export function getMotionAttribute(
    currentValue: string,
    previousValue: string,
    itemValue: string,
    itemValues: string[],
    dir: NavigationMenuDirection
): MotionAttribute | null {
    // Reverse values in RTL
    const values = dir === 'rtl' ? [...itemValues].reverse() : itemValues;

    const currentIndex = values.indexOf(currentValue);
    const prevIndex = values.indexOf(previousValue);
    const isSelected = itemValue === currentValue;
    const wasSelected = prevIndex === values.indexOf(itemValue);

    // Only update selected and previously selected content
    if (!isSelected && !wasSelected) return null;

    // Don't provide a direction on initial open
    if (currentIndex !== prevIndex) {
        // Moving to this item from another
        if (isSelected && prevIndex !== -1) {
            return currentIndex > prevIndex ? 'from-end' : 'from-start';
        }
        // Leaving this item for another
        if (wasSelected && currentIndex !== -1) {
            return currentIndex > prevIndex ? 'to-start' : 'to-end';
        }
    }

    // Default case - entering or leaving the list
    return null;
}

export function focusFirst(candidates: HTMLElement[], preventScroll = false): boolean {
    const previouslyFocusedElement = document.activeElement;
    return candidates.some((candidate) => {
        // If focus is already where we want to go, don't change anything
        if (candidate === previouslyFocusedElement) return true;
        candidate.focus({ preventScroll });
        return document.activeElement !== previouslyFocusedElement;
    });
}

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
