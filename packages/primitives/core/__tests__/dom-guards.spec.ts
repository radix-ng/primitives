import { isElement, isHTMLElement, isKeyboardEvent, isMouseEvent, isNode, isShadowRoot } from '../src/dom/guards';

describe('cross-realm DOM guards', () => {
    it('recognizes HTML, SVG and shadow nodes without confusing a plain fragment with a shadow root', () => {
        const html = document.createElement('div');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const shadow = html.attachShadow({ mode: 'closed' });
        expect([isNode(html), isElement(html), isHTMLElement(html)]).toEqual([true, true, true]);
        expect([isNode(svg), isElement(svg), isHTMLElement(svg)]).toEqual([true, true, false]);
        expect(isShadowRoot(shadow)).toBe(true);
        expect(isShadowRoot(document.createDocumentFragment())).toBe(false);
        for (const value of [null, undefined, {}, window]) expect(isNode(value)).toBe(false);
    });

    it('recognizes iframe nodes and events, including null event views and adopted elements', () => {
        const frame = document.createElement('iframe');
        document.body.append(frame);
        try {
            const doc = frame.contentDocument!;
            const view = doc.defaultView!;
            const element = doc.createElement('input');
            const key = new view.KeyboardEvent('keydown', { key: 'ArrowDown' });
            const mouse = new view.MouseEvent('click', { detail: 1 });
            expect(key).not.toBeInstanceOf(KeyboardEvent);
            expect(mouse).not.toBeInstanceOf(MouseEvent);
            expect(isKeyboardEvent(key)).toBe(true);
            expect(isMouseEvent(mouse)).toBe(true);
            expect(isKeyboardEvent(mouse)).toBe(false);
            expect(isMouseEvent(key)).toBe(false);
            expect(isMouseEvent(new Event('click'))).toBe(false);
            expect(isHTMLElement(element)).toBe(true);
            document.adoptNode(element);
            expect(isHTMLElement(element)).toBe(true);
        } finally {
            frame.remove();
        }
    });
});
