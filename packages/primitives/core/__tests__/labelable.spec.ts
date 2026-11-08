import { describe, expect, it } from 'vitest';
import { createLabelRegistry, getLabelControl } from '../src/labelable';

describe('shared label registry', () => {
    it('keeps a replacement with the same id when its predecessor is destroyed', () => {
        const registry = createLabelRegistry();
        const removeOld = registry.registerLabel('label');
        const removeNew = registry.registerLabel('label');
        removeOld();
        expect(registry.labelId()).toBe('label');
        removeNew();
        expect(registry.labelId()).toBeUndefined();
    });

    it('restores the previous live label when the current one is removed', () => {
        const registry = createLabelRegistry();
        const removeField = registry.registerLabel('field-label');
        const removeLocal = registry.registerLabel('select-label');
        expect(registry.labelId()).toBe('select-label');
        removeLocal();
        removeLocal();
        expect(registry.labelId()).toBe('field-label');
        removeField();
        expect(registry.labelId()).toBeUndefined();
    });

    it('does not share registrations across fields', () => {
        const first = createLabelRegistry();
        const second = createLabelRegistry();
        first.registerLabel('first');
        expect(second.labelId()).toBeUndefined();
    });
});

describe('label control lookup', () => {
    it('prefers the nearest shadow tree and searches enclosing trees', () => {
        const host = document.createElement('div');
        const outer = host.attachShadow({ mode: 'open' });
        const control = document.createElement('button');
        control.id = 'control';
        const innerHost = document.createElement('div');
        outer.append(control, innerHost);
        const inner = innerHost.attachShadow({ mode: 'open' });
        const label = document.createElement('span');
        inner.append(label);
        expect(getLabelControl(label, 'control')).toBe(control);
        const nearer = document.createElement('input');
        nearer.id = 'control';
        inner.append(nearer);
        expect(getLabelControl(label, 'control')).toBe(nearer);
    });

    it('uses the label document for an external control', () => {
        const otherDocument = document.implementation.createHTMLDocument('Other');
        const label = otherDocument.createElement('label');
        const input = otherDocument.createElement('input');
        input.id = 'other-control';
        otherDocument.body.append(label, input);
        expect(getLabelControl(label, input.id)).toBe(input);
    });
});
