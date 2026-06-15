// @vitest-environment jsdom
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createFloatingRootContext, provideFloatingRootContext } from '@radix-ng/primitives/core';
import { FOCUS_GUARD_ATTR } from '@radix-ng/primitives/focus-scope';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager,
    RdxInitialFocus,
    RdxReturnFocus,
    resolveFocusTarget,
    resolveInitialFocus,
    resolveReturnFocus
} from '../src/floating-focus-manager';
import { RDX_FLOATING_MARKER } from '../src/mark-others';

const flush = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

@Component({
    imports: [RdxFloatingFocusManager],
    template: `
        <div
            #scope
            [modal]="modal()"
            [enabled]="enabled()"
            [closeOnFocusOut]="closeOnFocusOut()"
            [initialFocus]="initialFocus()"
            [returnFocus]="returnFocus()"
            rdxFloatingFocusManager
        >
            <button #a>A</button>
            <button #b>B</button>
        </div>
    `
})
class ManagerHost {
    readonly modal = signal(false);
    readonly enabled = signal(true);
    readonly closeOnFocusOut = signal(true);
    readonly initialFocus = signal<RdxInitialFocus>(null);
    readonly returnFocus = signal<RdxReturnFocus>(true);
    readonly scope = viewChild.required('scope', { read: ElementRef });
    readonly a = viewChild.required('a', { read: ElementRef });
    readonly b = viewChild.required('b', { read: ElementRef });
    readonly manager = viewChild.required(RdxFloatingFocusManager);
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

    it('a primitive config drives the gates when the matching input is unset', async () => {
        @Component({
            imports: [RdxFloatingFocusManager],
            providers: [provideFloatingFocusManagerConfig(() => ({ modal: () => true }))],
            template: `
                <div #scope rdxFloatingFocusManager>
                    <button #a>A</button>
                </div>
            `
        })
        class ConfigHost {
            readonly scope = viewChild.required('scope', { read: ElementRef });
            readonly a = viewChild.required('a', { read: ElementRef });
        }

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ConfigHost);
        fixture.autoDetectChanges();
        await flush();

        const inside = fixture.componentInstance.a().nativeElement as HTMLElement;
        inside.focus();
        outside.focus();

        // config `modal: () => true` (no `[modal]` input) → the manager traps focus
        expect(document.activeElement).toBe(inside);
        outside.remove();
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

    it('keeps additional owned root elements from the context (e.g. a Dialog backdrop)', async () => {
        const backdrop = document.createElement('div');
        document.body.appendChild(backdrop);
        appended.push(backdrop);
        const unrelated = document.createElement('div');
        document.body.appendChild(unrelated);
        appended.push(unrelated);

        const context = createFloatingRootContext({ ownerDocument: document, open: () => true });
        context.addFloatingElement(backdrop);

        @Component({
            imports: [RdxFloatingFocusManager],
            providers: [provideFloatingRootContext(() => context)],
            template: `
                <div #scope rdxFloatingFocusManager></div>
            `
        })
        class BackdropHost {
            readonly scope = viewChild.required('scope', { read: ElementRef });
        }

        const fixture = TestBed.createComponent(BackdropHost);
        fixture.autoDetectChanges();
        await flush();

        // The backdrop is an owned root → NOT marked; an unrelated sibling IS.
        expect(backdrop.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
        expect(unrelated.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
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

    // ─── close-on-focus-out (ADR 0017 §3) ────────────────────────────────────

    function focusOutTo(host: HTMLElement, relatedTarget: EventTarget | null): void {
        host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));
    }

    async function setupManager(): Promise<{
        host: HTMLElement;
        emitted: () => boolean;
        fixture: ReturnType<typeof TestBed.createComponent<ManagerHost>>;
    }> {
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();
        let emitted = false;
        fixture.componentInstance.manager().focusOut.subscribe(() => (emitted = true));
        return { host: fixture.componentInstance.scope().nativeElement, emitted: () => emitted, fixture };
    }

    it('emits focusOut when a non-modal popup loses focus to an unrelated node', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const { host, emitted } = await setupManager();
        focusOutTo(host, outside);

        expect(emitted()).toBe(true);
    });

    it('does NOT emit when focus stays inside the popup', async () => {
        const { host, emitted, fixture } = await setupManager();
        focusOutTo(host, fixture.componentInstance.a().nativeElement);
        expect(emitted()).toBe(false);
    });

    it('does NOT emit for a modal popup (the trap keeps focus in)', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();
        let emitted = false;
        fixture.componentInstance.manager().focusOut.subscribe(() => (emitted = true));

        focusOutTo(fixture.componentInstance.scope().nativeElement, outside);
        expect(emitted).toBe(false);
    });

    it('does NOT emit when relatedTarget is null (tab-away / window blur)', async () => {
        const { host, emitted } = await setupManager();
        focusOutTo(host, null);
        expect(emitted()).toBe(false);
    });

    it('does NOT emit when relatedTarget is a focus guard', async () => {
        const guard = document.createElement('span');
        guard.setAttribute(FOCUS_GUARD_ATTR, '');
        document.body.appendChild(guard);
        appended.push(guard);

        const { host, emitted } = await setupManager();
        focusOutTo(host, guard);
        expect(emitted()).toBe(false);
    });

    it('does NOT emit during a pointer press (a drag must not close)', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const { host, emitted } = await setupManager();
        document.dispatchEvent(new Event('pointerdown'));
        focusOutTo(host, outside);
        expect(emitted()).toBe(false);

        document.dispatchEvent(new Event('pointerup'));
        focusOutTo(host, outside);
        expect(emitted()).toBe(true); // after the press ends, focus-out closes again
    });

    it('does NOT emit when closeOnFocusOut is false', async () => {
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        appended.push(outside);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.closeOnFocusOut.set(false);
        fixture.autoDetectChanges();
        await flush();
        let emitted = false;
        fixture.componentInstance.manager().focusOut.subscribe(() => (emitted = true));

        focusOutTo(fixture.componentInstance.scope().nativeElement, outside);
        expect(emitted).toBe(false);
    });

    // ─── initial / return focus orchestration (ADR 0017 §2) ──────────────────

    it('initialFocus overrides the scope default — focuses the specified element on open', async () => {
        const fixture = TestBed.createComponent(ManagerHost);
        // resolve B lazily (it exists by the time mountAutoFocus fires)
        fixture.componentInstance.initialFocus.set(() => fixture.componentInstance.b().nativeElement);
        fixture.autoDetectChanges();
        await flush();

        expect(document.activeElement).toBe(fixture.componentInstance.b().nativeElement);
    });

    it('falls back to the scope default (first tabbable) when initialFocus is null', async () => {
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();

        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
    });

    it('tracks the interaction type (keyboard / pointer)', async () => {
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();
        const manager = fixture.componentInstance.manager();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
        expect(manager.interactionType()).toBe('keyboard');

        document.dispatchEvent(new Event('pointerdown'));
        expect(manager.interactionType()).toBe('mouse');
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

        it('resolveReturnFocus passes through booleans and resolves targets', () => {
            const el = document.createElement('button');
            expect(resolveReturnFocus(true, '')).toBe(true);
            expect(resolveReturnFocus(false, '')).toBe(false);
            expect(resolveReturnFocus(el, '')).toBe(el);
            expect(resolveReturnFocus(() => false, 'keyboard')).toBe(false);
            expect(resolveReturnFocus((type) => (type === 'keyboard' ? el : false), 'keyboard')).toBe(el);
        });
    });
});
