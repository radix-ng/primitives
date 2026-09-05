// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { isTypeableElement } from '../src/utils';

function render(html: string): HTMLElement {
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);
    return host.firstElementChild as HTMLElement;
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('isTypeableElement', () => {
    it('accepts the elements a user can type into', () => {
        expect(isTypeableElement(render('<input />'))).toBe(true);
        expect(isTypeableElement(render('<input type="email" />'))).toBe(true);
        expect(isTypeableElement(render('<textarea></textarea>'))).toBe(true);
        expect(isTypeableElement(render('<div contenteditable="true"></div>'))).toBe(true);
    });

    it('rejects disabled, hidden, and non-editable elements', () => {
        expect(isTypeableElement(render('<input disabled />'))).toBe(false);
        expect(isTypeableElement(render('<input type="hidden" />'))).toBe(false);
        expect(isTypeableElement(render('<textarea disabled></textarea>'))).toBe(false);
        expect(isTypeableElement(render('<div contenteditable="false"></div>'))).toBe(false);
        expect(isTypeableElement(render('<button>press</button>'))).toBe(false);
    });

    it('rejects non-elements', () => {
        expect(isTypeableElement(null)).toBe(false);
        expect(isTypeableElement(undefined)).toBe(false);
        expect(isTypeableElement(document.createTextNode('text'))).toBe(false);
        expect(isTypeableElement({ matches: () => true })).toBe(false);
    });
});
