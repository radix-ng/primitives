// @vitest-environment jsdom
import { markOthers, RDX_FLOATING_MARKER } from '../src/mark-others';
import { afterEach, describe, expect, it } from 'vitest';

describe('markOthers', () => {
    const undos: Array<() => void> = [];
    const appended: Element[] = [];

    function tree(): { popup: HTMLElement; s1: HTMLElement; s2: HTMLElement; container: HTMLElement } {
        const root = document.createElement('div');
        root.innerHTML = `
            <div id="s1">s1</div>
            <div id="container"><div id="popup">popup</div></div>
            <div id="s2">s2</div>
        `;
        document.body.appendChild(root);
        appended.push(root);
        return {
            popup: root.querySelector('#popup')!,
            container: root.querySelector('#container')!,
            s1: root.querySelector('#s1')!,
            s2: root.querySelector('#s2')!
        };
    }

    function mark(avoid: Element[], options?: Parameters<typeof markOthers>[1]): void {
        undos.push(markOthers(avoid, options));
    }

    afterEach(() => {
        undos.splice(0).forEach((undo) => undo());
        appended.splice(0).forEach((el) => el.remove());
    });

    it('marks elements outside the kept subtree, not the popup or its ancestors', () => {
        const { popup, container, s1, s2 } = tree();

        mark([popup]);

        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
        expect(s2.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
        // the popup and its ancestor container are inside the kept path → untouched
        expect(popup.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
        expect(container.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
    });

    it('aria-hides outside elements when ariaHidden is set', () => {
        const { popup, s1 } = tree();

        mark([popup], { ariaHidden: true, mark: false });

        expect(s1.getAttribute('aria-hidden')).toBe('true');
        // mark:false → no marker attribute
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
    });

    it('undo removes the attributes it applied', () => {
        const { popup, s1 } = tree();

        const undo = markOthers([popup]);
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);

        undo();
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
    });

    it('ref-counts overlapping calls — clears only when the last undo runs', () => {
        const { popup, s1 } = tree();

        const undoA = markOthers([popup]);
        const undoB = markOthers([popup]);
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);

        undoA();
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(true); // still held by B

        undoB();
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
    });

    it('leaves a pre-existing aria-hidden element hidden after undo', () => {
        const { popup, s1 } = tree();
        s1.setAttribute('aria-hidden', 'true'); // already hidden by the app

        const undo = markOthers([popup], { ariaHidden: true, mark: false });
        expect(s1.getAttribute('aria-hidden')).toBe('true');

        undo();
        // we did not own it, so it stays hidden
        expect(s1.getAttribute('aria-hidden')).toBe('true');
    });

    it('keeps aria-live regions announceable (does not aria-hide them)', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <div id="live" aria-live="polite">live</div>
            <div id="popup">popup</div>
        `;
        document.body.appendChild(root);
        appended.push(root);

        mark([root.querySelector('#popup')!], { ariaHidden: true, mark: false });

        expect(root.querySelector('#live')!.getAttribute('aria-hidden')).toBeNull();
    });

    it('is a no-op for an empty avoid list', () => {
        const { s1 } = tree();
        markOthers([])();
        expect(s1.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
    });
});
