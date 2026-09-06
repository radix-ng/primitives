// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { dispatchClickWithModifiers } from '../src/dom/dispatch-click';

afterEach(() => {
    document.body.innerHTML = '';
});

function link(): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.href = '#target';
    document.body.appendChild(anchor);
    return anchor;
}

describe('dispatchClickWithModifiers', () => {
    it('carries the source event’s modifiers onto the synthetic click', () => {
        // `element.click()` drops these, so a Cmd-click on a link would navigate in the current tab.
        const target = link();
        let received: MouseEvent | undefined;
        target.addEventListener('click', (event) => {
            received = event as MouseEvent;
            event.preventDefault();
        });

        dispatchClickWithModifiers(
            target,
            new MouseEvent('mouseup', { metaKey: true, shiftKey: true, ctrlKey: false, altKey: false }),
            { detail: 1 }
        );

        expect(received?.metaKey).toBe(true);
        expect(received?.shiftKey).toBe(true);
        expect(received?.ctrlKey).toBe(false);
        expect(received?.altKey).toBe(false);
    });

    it('reports the given detail, so a pointer gesture is not read as a keyboard activation', () => {
        const target = link();
        const details: number[] = [];
        target.addEventListener('click', (event) => {
            details.push((event as MouseEvent).detail);
            event.preventDefault();
        });

        dispatchClickWithModifiers(target, new MouseEvent('mouseup'), { detail: 1 });
        dispatchClickWithModifiers(target, new MouseEvent('mouseup'));

        expect(details).toEqual([1, 0]);
    });

    it('bubbles and is cancelable', () => {
        const target = link();
        let seenOnBody = false;
        document.body.addEventListener('click', (event) => {
            seenOnBody = true;
            expect(event.cancelable).toBe(true);
            event.preventDefault();
        });

        dispatchClickWithModifiers(target, new MouseEvent('mouseup'), { detail: 1 });
        expect(seenOnBody).toBe(true);
    });
});
