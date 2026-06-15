// @vitest-environment jsdom
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RdxFocusScope } from '../src/focus-scope';
import { createFocusScopesStack, FocusScopeAPI, removeLinks } from '../src/stack';
import { getTabbableCandidates, getTabbableEdges } from '../src/utils';

/**
 * Characterization of the CURRENT `RdxFocusScope` behavior (ADR 0017 Phase 0 / 1a). These lock the
 * observable contract that the Phase-1a rework (owner-`Document`, shadow/`composedPath` containment,
 * queued focus, `WeakMap<Document>` stack) must preserve. Real cross-document / shadow / rAF timing is
 * Playwright's job; this pins the jsdom-deterministic surface.
 */

// Drains microtasks (mount auto-focus) AND a window animation frame (the queued return-focus).
const flush = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

// ─── Tab loop (handleKeyDown) ─────────────────────────────────────────────────

@Component({
    imports: [RdxFocusScope],
    template: `
        <div #scope [loop]="loop()" rdxFocusScope>
            <button #a>A</button>
            <button #b>B</button>
            <button #c>C</button>
        </div>
    `
})
class LoopHost {
    readonly loop = signal(false);
    readonly scope = viewChild.required('scope', { read: ElementRef });
    readonly a = viewChild.required('a', { read: ElementRef });
    readonly b = viewChild.required('b', { read: ElementRef });
    readonly c = viewChild.required('c', { read: ElementRef });
}

describe('RdxFocusScope characterization', () => {
    beforeEach(() => TestBed.resetTestingModule());

    describe('Tab loop (handleKeyDown)', () => {
        function tab(scope: HTMLElement, shift = false): KeyboardEvent {
            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                shiftKey: shift,
                bubbles: true,
                cancelable: true
            });
            scope.dispatchEvent(event);
            return event;
        }

        it('wraps Tab from the last element to the first when loop is on', () => {
            const fixture = TestBed.createComponent(LoopHost);
            fixture.componentInstance.loop.set(true);
            fixture.detectChanges();
            const host = fixture.componentInstance.scope().nativeElement as HTMLElement;

            (fixture.componentInstance.c().nativeElement as HTMLElement).focus();
            const event = tab(host);

            expect(event.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        });

        it('wraps Shift+Tab from the first element to the last when loop is on', () => {
            const fixture = TestBed.createComponent(LoopHost);
            fixture.componentInstance.loop.set(true);
            fixture.detectChanges();
            const host = fixture.componentInstance.scope().nativeElement as HTMLElement;

            (fixture.componentInstance.a().nativeElement as HTMLElement).focus();
            const event = tab(host, true);

            expect(event.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(fixture.componentInstance.c().nativeElement);
        });

        it('prevents default at the edge but does not wrap when loop is off', () => {
            const fixture = TestBed.createComponent(LoopHost);
            fixture.detectChanges();
            const host = fixture.componentInstance.scope().nativeElement as HTMLElement;

            const last = fixture.componentInstance.c().nativeElement as HTMLElement;
            last.focus();
            const event = tab(host);

            expect(event.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(last); // no wrap
        });

        it('does not interfere with a non-edge Tab', () => {
            const fixture = TestBed.createComponent(LoopHost);
            fixture.componentInstance.loop.set(true);
            fixture.detectChanges();
            const host = fixture.componentInstance.scope().nativeElement as HTMLElement;

            (fixture.componentInstance.b().nativeElement as HTMLElement).focus(); // middle
            const event = tab(host);

            expect(event.defaultPrevented).toBe(false);
        });
    });

    // ─── focus scope stack (module-global pause/resume) ───────────────────────

    describe('focus scope stack', () => {
        const tracked: FocusScopeAPI[] = [];

        function makeScope(): FocusScopeAPI {
            const paused = signal(false);
            const scope: FocusScopeAPI = { paused, pause: () => paused.set(true), resume: () => paused.set(false) };
            tracked.push(scope);
            return scope;
        }

        afterEach(() => {
            // Drain anything a test left in the (per-document) stack so tests stay isolated.
            const stack = createFocusScopesStack(document);
            tracked.splice(0).forEach((scope) => stack.remove(scope));
        });

        it('pauses the previously-active scope when a new one is added', () => {
            const stack = createFocusScopesStack(document);
            const a = makeScope();
            const b = makeScope();

            stack.add(a);
            expect(a.paused()).toBe(false);

            stack.add(b);
            expect(a.paused()).toBe(true);
            expect(b.paused()).toBe(false);
        });

        it('resumes the new top scope when the active one is removed', () => {
            const stack = createFocusScopesStack(document);
            const a = makeScope();
            const b = makeScope();
            stack.add(a);
            stack.add(b);

            stack.remove(b);
            expect(a.paused()).toBe(false); // a is the new top, resumed
        });

        it('shares one stack per document (instances for the same document coordinate)', () => {
            const s1 = createFocusScopesStack(document);
            const s2 = createFocusScopesStack(document);
            const a = makeScope();
            const b = makeScope();

            s1.add(a);
            s2.add(b); // same document → adding through a different instance still pauses a

            expect(a.paused()).toBe(true);
        });

        it('isolates the stack per document (a scope in another document does not pause this one)', () => {
            const otherDoc = document.implementation.createHTMLDocument('iframe');
            const here = createFocusScopesStack(document);
            const there = createFocusScopesStack(otherDoc);
            const a = makeScope();
            const b = makeScope();

            here.add(a);
            there.add(b); // different document → must NOT pause `a`

            expect(a.paused()).toBe(false);
            there.remove(b);
        });
    });

    // ─── tabbable utils ───────────────────────────────────────────────────────

    describe('tabbable utils', () => {
        it('getTabbableCandidates collects tabbable elements and skips disabled/hidden', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="x">x</button>
                <button id="d" disabled>d</button>
                <input id="h" type="hidden" />
                <a id="link" href="#">link</a>
            `;
            const ids = getTabbableCandidates(container).map((el) => el.id);

            expect(ids).toContain('x');
            expect(ids).toContain('link');
            expect(ids).not.toContain('d'); // disabled skipped
            expect(ids).not.toContain('h'); // hidden input skipped
        });

        it('getTabbableEdges returns the first and last tabbable element', () => {
            const container = document.createElement('div');
            container.innerHTML = `<button id="first">f</button><button id="mid">m</button><button id="last">l</button>`;
            document.body.appendChild(container);

            const [first, last] = getTabbableEdges(container);
            expect(first?.id).toBe('first');
            expect(last?.id).toBe('last');

            container.remove();
        });

        it('removeLinks strips anchor elements', () => {
            const button = document.createElement('button');
            const anchor = document.createElement('a');
            expect(removeLinks([button, anchor])).toEqual([button]);
        });
    });

    // ─── auto-focus on mount ──────────────────────────────────────────────────

    describe('auto-focus on mount', () => {
        it('focuses the first tabbable element on mount', async () => {
            const fixture = TestBed.createComponent(LoopHost);
            fixture.autoDetectChanges();
            await flush();

            expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        });

        it('mountAutoFocus is preventable (preventDefault skips the auto-focus)', async () => {
            @Component({
                imports: [RdxFocusScope],
                template: `
                    <div (mountAutoFocus)="$event.preventDefault()" rdxFocusScope>
                        <button #a>A</button>
                    </div>
                `
            })
            class PreventHost {
                readonly a = viewChild.required('a', { read: ElementRef });
            }

            const outside = document.createElement('button');
            document.body.appendChild(outside);
            outside.focus();

            const fixture = TestBed.createComponent(PreventHost);
            fixture.autoDetectChanges();
            await flush();

            // auto-focus was vetoed → focus did not move into the scope
            expect(document.activeElement).not.toBe(fixture.componentInstance.a().nativeElement);
            outside.remove();
        });
    });

    // ─── return focus on unmount ──────────────────────────────────────────────

    describe('return focus on unmount', () => {
        it('restores focus to the previously-focused element after destroy', async () => {
            const outside = document.createElement('button');
            document.body.appendChild(outside);
            outside.focus();
            expect(document.activeElement).toBe(outside);

            const fixture = TestBed.createComponent(LoopHost);
            fixture.autoDetectChanges();
            await flush(); // mount auto-focus moves focus into the scope
            expect(document.activeElement).not.toBe(outside);

            fixture.destroy();
            await flush(); // unmount return-focus runs in a setTimeout(0)

            expect(document.activeElement).toBe(outside);
            outside.remove();
        });
    });

    // ─── trapped containment ──────────────────────────────────────────────────

    describe('trapped containment', () => {
        @Component({
            imports: [RdxFocusScope],
            template: `
                <div #scope rdxFocusScope trapped>
                    <button #a>A</button>
                    <button #b>B</button>
                </div>
            `
        })
        class TrappedHost {
            readonly scope = viewChild.required('scope', { read: ElementRef });
            readonly a = viewChild.required('a', { read: ElementRef });
        }

        it('returns focus inside when focus moves to a legitimate element outside the trap', async () => {
            const outside = document.createElement('button');
            document.body.appendChild(outside);

            const fixture = TestBed.createComponent(TrappedHost);
            fixture.autoDetectChanges();
            await flush(); // mount + trap listeners attached

            const inside = fixture.componentInstance.a().nativeElement as HTMLElement;
            inside.focus(); // focusin marks `inside` as the last-focused element in the scope

            // focus actually leaves to a legitimate outside element → the native focusout (relatedTarget
            // = outside) drives the trap, which pulls focus back inside
            outside.focus();

            expect(document.activeElement).toBe(inside);
            outside.remove();
        });

        // The `relatedTarget === null` early-return (tab-away / element-removed, Chrome CPU-spin guard)
        // depends on browser-specific blur semantics and is verified in Playwright, not jsdom.
    });
});
