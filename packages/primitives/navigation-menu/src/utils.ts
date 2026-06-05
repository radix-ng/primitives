/**
 * Generate a short unique id segment.
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

/**
 * Collect the tabbable elements inside a container, in DOM order, skipping hidden ones.
 */
export function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
    if (!container || !container.querySelectorAll) {
        return [];
    }

    const TABBABLE_SELECTOR =
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), ' +
        '[contenteditable="true"]:not([tabindex="-1"])';

    const elements = Array.from(container.querySelectorAll(TABBABLE_SELECTOR)) as HTMLElement[];

    return elements.filter((element) => {
        if (element.tabIndex < 0) {
            return false;
        }

        if (element.hasAttribute('disabled')) {
            return false;
        }

        if (element.getAttribute('aria-hidden') === 'true') {
            return false;
        }

        let current: HTMLElement | null = element;

        while (current) {
            const style = window.getComputedStyle(current);

            if (style.display === 'none' || style.visibility === 'hidden') {
                return false;
            }

            current = current.parentElement;
        }

        return true;
    });
}

/**
 * Focus the first focusable candidate, returning whether focus moved.
 */
export function focusFirst(candidates: HTMLElement[], preventScroll = false): boolean {
    const previouslyFocused = document.activeElement;

    return candidates.some((candidate) => {
        if (candidate === previouslyFocused) {
            return true;
        }

        candidate.focus({ preventScroll });
        return document.activeElement !== previouslyFocused;
    });
}

/**
 * Derive a slide direction (e.g. `"left"`, `"right up"`) from the relative position of two triggers.
 * Used by the viewport to animate content as the active item changes.
 */
export function getActivationDirection(previous: HTMLElement, next: HTMLElement): string | undefined {
    const previousCenter = getCenter(previous.getBoundingClientRect());
    const nextCenter = getCenter(next.getBoundingClientRect());
    const directions: string[] = [];

    if (nextCenter.x < previousCenter.x) {
        directions.push('left');
    } else if (nextCenter.x > previousCenter.x) {
        directions.push('right');
    }

    if (nextCenter.y < previousCenter.y) {
        directions.push('up');
    } else if (nextCenter.y > previousCenter.y) {
        directions.push('down');
    }

    return directions.join(' ') || undefined;
}

/**
 * Remove `id` from an element and all its descendants (used when cloning content for an exit
 * animation, to avoid duplicate ids in the document).
 */
export function removeIds(element: HTMLElement): void {
    element.removeAttribute('id');
    element.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
}

function getCenter(rect: DOMRect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
