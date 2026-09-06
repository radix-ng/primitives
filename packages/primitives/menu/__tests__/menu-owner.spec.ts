// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { findMenuOwnerId, MENU_OWNER_ATTR } from '../src/menu-owner';

afterEach(() => {
    document.body.innerHTML = '';
});

function positioner(ownerId: string, innerHTML = '<div class="popup"><button>item</button></div>'): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute(MENU_OWNER_ATTR, ownerId);
    element.innerHTML = innerHTML;
    document.body.appendChild(element);
    return element;
}

describe('findMenuOwnerId', () => {
    it('traces an element inside a positioner back to its menu', () => {
        const element = positioner('menu-1');
        expect(findMenuOwnerId(element.querySelector('button'))).toBe('menu-1');
        expect(findMenuOwnerId(element)).toBe('menu-1');
    });

    it('traces a submenu portaled outside the root popup', () => {
        // The real anatomy: a submenu positioner is a sibling of the root's, not a descendant, and
        // carries the same owner id.
        positioner('menu-1');
        const submenu = positioner('menu-1', '<div><button class="sub-item">sub</button></div>');
        expect(findMenuOwnerId(submenu.querySelector('.sub-item'))).toBe('menu-1');
    });

    it('keeps menus apart and reports nothing outside them', () => {
        const other = positioner('menu-2');
        expect(findMenuOwnerId(other.querySelector('button'))).toBe('menu-2');

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        expect(findMenuOwnerId(outside)).toBeUndefined();
        expect(findMenuOwnerId(null)).toBeUndefined();
    });

    it('recognizes an element from another document (iframe, other realm)', () => {
        // `instanceof Element` is per-realm: a node from an iframe fails it and would look like it
        // belongs to no menu, so the release inside it would be treated as an outside press.
        const frame = document.createElement('iframe');
        document.body.appendChild(frame);
        const frameDocument = frame.contentDocument!;

        const framePositioner = frameDocument.createElement('div');
        framePositioner.setAttribute(MENU_OWNER_ATTR, 'menu-4');
        const button = frameDocument.createElement('button');
        framePositioner.appendChild(button);
        frameDocument.body.appendChild(framePositioner);

        expect(button instanceof Element).toBe(false); // the realm trap this guards against
        expect(findMenuOwnerId(button)).toBe('menu-4');
    });

    it('walks out of a shadow root', () => {
        const host = positioner('menu-3', '');
        const inner = document.createElement('div');
        host.appendChild(inner);
        const shadow = inner.attachShadow({ mode: 'open' });
        const button = document.createElement('button');
        shadow.appendChild(button);

        expect(findMenuOwnerId(button)).toBe('menu-3');
    });
});
