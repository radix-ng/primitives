// @vitest-environment jsdom
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RdxFloatingFocusManager, resolveFocusTarget, resolveInitialFocus } from '../src/floating-focus-manager';
import { RDX_FLOATING_MARKER } from '../src/mark-others';

const flush = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

@Component({
    imports: [RdxFloatingFocusManager],
    template: `
        <div #scope [modal]="modal()" [enabled]="enabled()" rdxFloatingFocusManager>
            <button #a>A</button>
            <button #b>B</button>
        </div>
    `
})
class ManagerHost {
    readonly modal = signal(false);
    readonly enabled = signal(true);
    readonly scope = viewChild.required('scope', { read: ElementRef });
    readonly a = viewChild.required('a', { read: ElementRef });
    readonly b = viewChild.required('b', { read: ElementRef });
}

describe('RdxFloatingFocusManager (skeleton)', () => {
    const appended: Element[] = [];

    afterEach(() => appended.splice(0).forEach((el) => el.remove()));
    beforeEach(() => TestBed.resetTestingModule());

    // ─── modal → RdxFocusScope.trapped composition ────────────────────────────

    it('traps focus (via composed RdxFocusScope) when modal and enabled', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();

        const inside = fixture.componentInstance.a().nativeElement as HTMLElement;
        inside.focus();
        outside.focus(); // native focusout (relatedTarget=outside) → the trap pulls focus back inside

        expect(document.activeElement).toBe(inside);
    });

    it('does NOT trap when non-modal (modal = false)', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ManagerHost);
        // modal stays false
        fixture.autoDetectChanges();
        await flush();

        const inside = fixture.componentInstance.a().nativeElement as HTMLElement;
        inside.focus();
        outside.focus();

        expect(document.activeElement).toBe(outside); // focus is free to leave
    });

    it('does NOT trap when disabled, even if modal (manager off)', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.componentInstance.enabled.set(false);
        fixture.autoDetectChanges();
        await flush();

        const inside = fixture.componentInstance.a().nativeElement as HTMLElement;
        inside.focus();
        outside.focus();

        expect(document.activeElement).toBe(outside);
    });

    it('reactively re-enables the trap when modal flips true', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();

        fixture.componentInstance.modal.set(true);
        await flush();

        // focus a fresh inside element (B, not the auto-focused A) so the freshly-attached trap records
        // it via `focusin`, then verify focus leaving is pulled back
        const inside = fixture.componentInstance.b().nativeElement as HTMLElement;
        inside.focus();
        outside.focus();

        expect(document.activeElement).toBe(inside);
    });

    // ─── markOthers passes (ADR 0017 §3) ─────────────────────────────────────

    it('marks outside elements while active, but does NOT aria-hide them when non-modal', async () => {
        const sibling = document.createElement('div');
        document.body.appendChild(sibling);
        appended.push(sibling);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();

        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
        expect(sibling.getAttribute('aria-hidden')).toBeNull(); // non-modal → no a11y isolation
    });

    it('aria-hides outside elements when modal', async () => {
        const sibling = document.createElement('div');
        document.body.appendChild(sibling);
        appended.push(sibling);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();

        expect(sibling.getAttribute('aria-hidden')).toBe('true');
        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(true); // marker still applied (active)
    });

    it('clears the marks when the manager is disabled', async () => {
        const sibling = document.createElement('div');
        document.body.appendChild(sibling);
        appended.push(sibling);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();
        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);

        fixture.componentInstance.enabled.set(false);
        await flush();

        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
        expect(sibling.getAttribute('aria-hidden')).toBeNull();
    });

    // ─── policy resolvers (§2 contract) ───────────────────────────────────────

    describe('policy resolvers', () => {
        it('resolveFocusTarget handles element, getter, and null', () => {
            const el = document.createElement('button');
            expect(resolveFocusTarget(el)).toBe(el);
            expect(resolveFocusTarget(() => el)).toBe(el);
            expect(resolveFocusTarget(null)).toBeNull();
            expect(resolveFocusTarget(() => null)).toBeNull();
        });

        it('resolveInitialFocus passes the open interaction type to a callback', () => {
            const keyboardEl = document.createElement('button');
            const pointerEl = document.createElement('button');
            const policy = (type: 'mouse' | 'touch' | 'pen' | 'keyboard' | '' | null) =>
                type === 'keyboard' ? keyboardEl : pointerEl;

            expect(resolveInitialFocus(policy, 'keyboard')).toBe(keyboardEl);
            expect(resolveInitialFocus(policy, 'mouse')).toBe(pointerEl);
            // a plain target ignores the interaction type
            expect(resolveInitialFocus(keyboardEl, 'mouse')).toBe(keyboardEl);
        });
    });
});
