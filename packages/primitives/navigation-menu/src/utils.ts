import { tabbable } from '@radix-ng/primitives/focus-scope';

/** Collect native HTML Tab candidates, excluding inert outgoing/kept-mounted content. */
export function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
    return tabbable(container).filter(
        (element): element is HTMLElement => element.namespaceURI === 'http://www.w3.org/1999/xhtml'
    );
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
