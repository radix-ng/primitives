export type Orientation = 'horizontal' | 'vertical';
export type Direction = 'ltr' | 'rtl';

export const ENTRY_FOCUS = 'rovingFocusGroup.onEntryFocus';
export const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type FocusIntent = 'first' | 'last' | 'prev' | 'next';

export const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
    ArrowLeft: 'prev',
    ArrowUp: 'prev',
    ArrowRight: 'next',
    ArrowDown: 'next',
    PageUp: 'first',
    Home: 'first',
    PageDown: 'last',
    End: 'last'
};

export function getDirectionAwareKey(key: string, dir?: Direction) {
    if (dir !== 'rtl') return key;
    return key === 'ArrowLeft' ? 'ArrowRight' : key === 'ArrowRight' ? 'ArrowLeft' : key;
}

export function getFocusIntent(event: KeyboardEvent, orientation?: Orientation, dir?: Direction) {
    const key = getDirectionAwareKey(event.key, dir);
    if (orientation === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(key)) return undefined;
    if (orientation === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(key)) return undefined;
    return MAP_KEY_TO_FOCUS_INTENT[key];
}

export function focusFirst(candidates: HTMLElement[], preventScroll = false, rootNode?: Document | ShadowRoot) {
    const PREVIOUSLY_FOCUSED_ELEMENT = rootNode?.activeElement ?? document.activeElement;
    for (const candidate of candidates) {
        // if focus is already where we want to go, we don't want to keep going through the candidates
        if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
        candidate.focus({ preventScroll });
        if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
    }
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
export function wrapArray<T>(array: T[], startIndex: number) {
    return array.map((_, index) => array[(startIndex + index) % array.length]);
}

/**
 * Sorts elements by their position in the document, so the order matches what the user sees.
 */
export function sortByDocumentPosition(elements: HTMLElement[]): HTMLElement[] {
    return [...elements].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}

let idCounter = 0;

export function generateId(): string {
    return `rf-item-${++idCounter}`;
}
