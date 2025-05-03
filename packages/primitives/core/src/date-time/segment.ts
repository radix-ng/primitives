import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, BACKSPACE, ENTER, SPACE } from '../kbd-constants';

export function isSegmentNavigationKey(key: string) {
    if (key === ARROW_RIGHT || key === ARROW_LEFT) return true;
    return false;
}

export function isNumberString(value: string) {
    if (Number.isNaN(Number.parseInt(value))) return false;
    return true;
}

export function isAcceptableSegmentKey(key: string) {
    const acceptableSegmentKeys = [
        ENTER,
        ARROW_UP,
        ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT,
        BACKSPACE,
        SPACE,
        'a',
        'A',
        'p',
        'P'
    ];
    if (acceptableSegmentKeys.includes(key)) return true;
    if (isNumberString(key)) return true;
    return false;
}

export function getSegmentElements(parentElement: HTMLElement): Element[] {
    return Array.from(parentElement.querySelectorAll('[data-rdx-date-field-segment]')).filter(
        (item) => item.getAttribute('data-rdx-date-field-segment') !== 'literal'
    );
}
