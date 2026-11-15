import { ElementRef } from '@angular/core';
import { resolvePortalContainer, type RdxPortalContainer } from '../src/resolve-container';

describe('portal container identity', () => {
    it('accepts native and ElementRef-wrapped ShadowRoots', () => {
        const root = document.createElement('div').attachShadow({ mode: 'open' });
        for (const target of [root, new ElementRef(root)])
            expect(resolvePortalContainer(target as RdxPortalContainer, document)).toBe(root);
    });

    it('accepts an iframe HTMLElement before and after adoption into the declaring document', () => {
        const frame = document.createElement('iframe');
        document.body.append(frame);
        try {
            const target = frame.contentDocument!.createElement('div');
            expect(target).not.toBeInstanceOf(HTMLElement);
            expect(resolvePortalContainer(target, document)).toBe(target);
            document.adoptNode(target);
            expect(resolvePortalContainer(target, document)).toBe(target);
        } finally {
            frame.remove();
        }
    });

    it.each([
        () => document.createDocumentFragment(),
        () => document.createTextNode('text'),
        () => document.createComment('comment'),
        () => document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        () => new ElementRef({}),
        () => new ElementRef(null)
    ])('rejects non-target nodes and invalid wrappers', (create) => {
        expect(resolvePortalContainer(create() as RdxPortalContainer, document)).toBeNull();
    });

    it('does not require a global HTMLElement constructor', () => {
        const element = document.createElement('div');
        const original = globalThis.HTMLElement;
        try {
            Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: undefined });
            expect(resolvePortalContainer(element, document)).toBe(element);
            expect(resolvePortalContainer(undefined, null)).toBeNull();
        } finally {
            Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: original });
        }
    });
});
