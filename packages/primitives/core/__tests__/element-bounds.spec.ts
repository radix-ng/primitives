// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getPseudoElementBounds, isMouseWithinBounds } from '../src/dom/element-bounds';

/** An element whose layout box is stubbed — jsdom reports zeroes for everything. */
function elementAt(left: number, top: number, width: number, height: number): HTMLElement {
    const element = document.createElement('button');
    document.body.appendChild(element);
    element.getBoundingClientRect = () =>
        ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect;
    return element;
}

function mouseAt(clientX: number, clientY: number): MouseEvent {
    return new MouseEvent('mouseup', { clientX, clientY });
}

describe('getPseudoElementBounds', () => {
    it('returns the plain rect where pseudo-element styles cannot be read', () => {
        // jsdom throws on `getComputedStyle(el, '::before')`, so the util must not even try there —
        // the pseudo-element widening is covered by the Playwright menu-trigger specs instead.
        expect(getPseudoElementBounds(elementAt(10, 20, 100, 40))).toMatchObject({
            left: 10,
            top: 20,
            right: 110,
            bottom: 60
        });
    });
});

describe('isMouseWithinBounds', () => {
    const element = elementAt(100, 100, 50, 20);

    it('accepts a release inside the element', () => {
        expect(isMouseWithinBounds(mouseAt(125, 110), element)).toBe(true);
    });

    it('tolerates a few pixels of pointer drift past the edge', () => {
        expect(isMouseWithinBounds(mouseAt(154, 110), element)).toBe(true);
        expect(isMouseWithinBounds(mouseAt(110, 96), element)).toBe(true);
    });

    it('rejects a release well outside the element', () => {
        expect(isMouseWithinBounds(mouseAt(170, 110), element)).toBe(false);
        expect(isMouseWithinBounds(mouseAt(125, 140), element)).toBe(false);
    });
});
