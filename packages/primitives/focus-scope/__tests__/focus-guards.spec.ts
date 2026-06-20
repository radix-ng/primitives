// @vitest-environment jsdom
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
    createAriaOwnsAnchor,
    createFocusGuard,
    disableFocusInside,
    enableFocusInside,
    FOCUS_GUARD_ATTR,
    isOutsideEvent,
    useFocusGuardsTabbability
} from '../src/focus-guards';

describe('focus guards', () => {
    const appended: Element[] = [];

    function host(html: string): HTMLElement {
        const el = document.createElement('div');
        el.innerHTML = html;
        document.body.appendChild(el);
        appended.push(el);
        return el;
    }

    afterEach(() => appended.splice(0).forEach((el) => el.remove()));

    // ─── createFocusGuard / createAriaOwnsAnchor ──────────────────────────────

    describe('createFocusGuard', () => {
        it('is a visually-hidden, tabbable, aria-hidden span', () => {
            const guard = createFocusGuard(document);

            expect(guard.tagName).toBe('SPAN');
            expect(guard.getAttribute('tabindex')).toBe('0');
            expect(guard.getAttribute('aria-hidden')).toBe('true');
            expect(guard.hasAttribute(FOCUS_GUARD_ATTR)).toBe(true);
            expect(guard.style.position).toBe('fixed');
            expect(guard.style.width).toBe('1px');
        });

        it('createAriaOwnsAnchor links the portal id via aria-owns', () => {
            const anchor = createAriaOwnsAnchor(document, 'portal-42');
            expect(anchor.getAttribute('aria-owns')).toBe('portal-42');
            expect(anchor.style.position).toBe('fixed');
        });
    });

    // ─── disableFocusInside / enableFocusInside ───────────────────────────────

    describe('disable / enable focus inside', () => {
        it('round-trips tabindex: suspends then restores original values', () => {
            const container = host(`
                <button id="b">b</button>
                <a id="a" href="#">a</a>
                <div id="t" tabindex="2">t</div>
            `);

            disableFocusInside(container);
            expect(container.querySelector('#b')!.getAttribute('tabindex')).toBe('-1');
            expect(container.querySelector('#a')!.getAttribute('tabindex')).toBe('-1');
            expect(container.querySelector('#t')!.getAttribute('tabindex')).toBe('-1');

            enableFocusInside(container);
            // button/anchor had no explicit tabindex → attribute removed entirely
            expect(container.querySelector('#b')!.hasAttribute('tabindex')).toBe(false);
            expect(container.querySelector('#a')!.hasAttribute('tabindex')).toBe(false);
            // the explicit tabindex="2" is restored verbatim
            expect(container.querySelector('#t')!.getAttribute('tabindex')).toBe('2');
        });

        it('enableFocusInside is a no-op when nothing was disabled', () => {
            const container = host(`<button id="b" tabindex="0">b</button>`);
            enableFocusInside(container);
            expect(container.querySelector('#b')!.getAttribute('tabindex')).toBe('0');
        });
    });

    // ─── isOutsideEvent ───────────────────────────────────────────────────────

    describe('isOutsideEvent', () => {
        it('is true when relatedTarget is null', () => {
            const container = host(`<button>x</button>`);
            expect(isOutsideEvent(new FocusEvent('focusout', { relatedTarget: null }), container)).toBe(true);
        });

        it('is true when relatedTarget is outside the container', () => {
            const container = host(`<button>x</button>`);
            const outside = host(`<button>o</button>`).querySelector('button')!;
            expect(isOutsideEvent(new FocusEvent('focusout', { relatedTarget: outside }), container)).toBe(true);
        });

        it('is false when relatedTarget is inside the container', () => {
            const container = host(`<button id="in">x</button>`);
            const inside = container.querySelector('#in')!;
            expect(isOutsideEvent(new FocusEvent('focusin', { relatedTarget: inside }), container)).toBe(false);
        });
    });

    // ─── useFocusGuardsTabbability (capture-phase toggle) ─────────────────────

    describe('useFocusGuardsTabbability', () => {
        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
            template: `
                <div #portal>
                    <button #inner>inner</button>
                </div>
            `
        })
        class GuardHost {
            readonly portal = viewChild.required('portal', { read: ElementRef });
            constructor() {
                useFocusGuardsTabbability(() => (this.portal() ? this.portal().nativeElement : null));
            }
        }

        it('disables content tabbability when focus leaves to outside, re-enables when it returns', () => {
            const outside = document.createElement('button');
            document.body.appendChild(outside);
            appended.push(outside);

            const fixture = TestBed.createComponent(GuardHost);
            fixture.detectChanges();

            const portal = fixture.componentInstance.portal().nativeElement as HTMLElement;
            const inner = portal.querySelector('button') as HTMLElement;

            // focus leaves the portal to an outside element → content becomes untabbable
            portal.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }));
            expect(inner.getAttribute('tabindex')).toBe('-1');

            // focus returns into the portal from outside → content tabbability restored
            portal.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: outside }));
            expect(inner.hasAttribute('tabindex')).toBe(false);
        });

        it('disables content tabbability on mount while focus is outside', () => {
            const outside = document.createElement('button');
            document.body.appendChild(outside);
            appended.push(outside);
            outside.focus();

            const fixture = TestBed.createComponent(GuardHost);
            fixture.detectChanges();

            const portal = fixture.componentInstance.portal().nativeElement as HTMLElement;
            const inner = portal.querySelector('button') as HTMLElement;

            expect(inner.getAttribute('tabindex')).toBe('-1');
        });

        it('ignores focus moves that stay inside the portal (relatedTarget inside)', () => {
            const fixture = TestBed.createComponent(GuardHost);
            fixture.detectChanges();

            const portal = fixture.componentInstance.portal().nativeElement as HTMLElement;
            const inner = portal.querySelector('button') as HTMLElement;

            portal.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: document.body }));
            // a focusout whose relatedTarget is still inside must NOT disable tabbability
            portal.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: inner }));
            expect(inner.hasAttribute('tabindex')).toBe(false);
        });
    });
});
