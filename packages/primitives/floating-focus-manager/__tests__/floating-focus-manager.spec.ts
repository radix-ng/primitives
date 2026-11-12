// @vitest-environment jsdom
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createFloatingRootContext, provideFloatingRootContext } from '@radix-ng/primitives/core';
import { FOCUS_GUARD_ATTR, RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    getInteractionTypeFromEvent,
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager,
    RdxInitialFocus,
    RdxReturnFocus,
    resolveFocusTarget,
    resolveInitialFocus,
    resolveReturnFocus
} from '../src/floating-focus-manager';
import { RDX_FLOATING_MARKER } from '../src/mark-others';
import { createRdxTriggerInteraction, RdxTriggerInteraction } from '../src/trigger-interaction';

const flush = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxFloatingFocusManager],
    template: `
        <div
            #scope
            [modal]="modal()"
            [enabled]="enabled()"
            [closeOnFocusOut]="closeOnFocusOut()"
            [initialFocus]="initialFocus()"
            [returnFocus]="returnFocus()"
            [restoreFocus]="restoreFocus()"
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
    readonly restoreFocus = signal<boolean | 'popup'>(false);
    readonly scope = viewChild.required('scope', { read: ElementRef });
    readonly a = viewChild.required('a', { read: ElementRef });
    readonly b = viewChild.required('b', { read: ElementRef });
    readonly manager = viewChild.required(RdxFloatingFocusManager);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxFloatingFocusManager],
    template: `
        <button #previous>Previous</button>
        <div
            #scope
            [beforeContentFocusGuardRef]="setBeforeGuard"
            [getInsideElements]="getInsideElements"
            [nextFocusableElement]="next"
            [previousFocusableElement]="previous"
            rdxFloatingFocusManager
        >
            <button #inside>Inside</button>
        </div>
        <button #next>Next</button>
    `
})
class PortalBridgeHost {
    readonly previous = viewChild.required('previous', { read: ElementRef });
    readonly scope = viewChild.required('scope', { read: ElementRef });
    readonly inside = viewChild.required('inside', { read: ElementRef });
    readonly next = viewChild.required('next', { read: ElementRef });
    readonly manager = viewChild.required(RdxFloatingFocusManager);
    readonly extraInside = signal<Element | null>(null);
    beforeGuard: HTMLSpanElement | null = null;

    readonly setBeforeGuard = (guard: HTMLSpanElement | null): void => {
        this.beforeGuard = guard;
    };

    readonly getInsideElements = (): Array<Element | null> => [this.extraInside()];
}

@Component({
    imports: [RdxFloatingFocusManager],
    template: `
        <div #parent [modal]="true" rdxFloatingFocusManager>
            <button>Parent</button>
            <div #child [enabled]="childEnabled()" rdxFloatingFocusManager><button>Child</button></div>
        </div>
    `
})
class RetainedChildHost {
    readonly childEnabled = signal(false);
    readonly parent = viewChild.required('parent', { read: RdxFocusScope });
    readonly child = viewChild.required('child', { read: RdxFocusScope });
}

describe('RdxFloatingFocusManager (skeleton)', () => {
    const appended: Element[] = [];

    afterEach(() => appended.splice(0).forEach((el) => el.remove()));
    beforeEach(() => TestBed.resetTestingModule());

    it('restoreFocus=true repairs removal even when the browser sends no focusout', async () => {
        const fixture = TestBed.createComponent(ManagerHost),
            host = fixture.componentInstance;
        host.restoreFocus.set(true);
        host.closeOnFocusOut.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        await flush();
        host.a().nativeElement.focus();
        host.a().nativeElement.remove();
        await flush();
        await flush();
        expect(document.activeElement).toBe(host.b().nativeElement);
    });

    it('restoreFocus=true preserves an explicit blur of a visible control', async () => {
        const fixture = TestBed.createComponent(ManagerHost),
            host = fixture.componentInstance;
        host.restoreFocus.set(true);
        host.closeOnFocusOut.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        await flush();
        host.a().nativeElement.focus();
        host.a().nativeElement.blur();
        await flush();
        await flush();
        expect(document.activeElement).toBe(document.body);
    });

    it('recognizes native keyboard PointerEvent clicks without reclassifying real touch clicks', () => {
        const keyboardClick = new MouseEvent('click', { detail: 0 });
        Object.defineProperty(keyboardClick, 'pointerType', { value: '' });
        expect(getInteractionTypeFromEvent(keyboardClick)).toBe('keyboard');
        const touchClick = new MouseEvent('click', { detail: 0 });
        Object.defineProperty(touchClick, 'pointerType', { value: 'touch' });
        expect(getInteractionTypeFromEvent(touchClick)).toBe('touch');
    });

    it('reapplies default initial focus when reopening before a retained scope deactivates', async () => {
        const open = signal(true);
        const context = createFloatingRootContext({ ownerDocument: document, open: () => open() });
        TestBed.overrideComponent(ManagerHost, {
            add: { providers: [provideFloatingRootContext(() => context)] }
        });
        const trigger = document.createElement('button');
        document.body.append(trigger);
        appended.push(trigger);
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        open.set(false);
        await fixture.whenStable();
        trigger.focus();
        open.set(true);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
    });

    it('waits for positioning before autofocus and does not reactivate on later layout updates', async () => {
        const ready = signal(false);
        TestBed.overrideComponent(ManagerHost, {
            add: { providers: [provideFloatingFocusManagerConfig(() => ({ initialFocusReady: () => ready() }))] }
        });
        const opener = document.createElement('button');
        document.body.append(opener);
        appended.push(opener);
        opener.focus();
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();
        expect(document.activeElement).toBe(opener);
        ready.set(true);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        fixture.componentInstance.b().nativeElement.focus();
        ready.set(false);
        await fixture.whenStable();
        await flush();
        ready.set(true);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.b().nativeElement);
    });

    it('releases a modal trap synchronously at logical close before scope teardown', async () => {
        const open = signal(true);
        const context = createFloatingRootContext({ ownerDocument: document, open: () => open() });
        TestBed.overrideComponent(ManagerHost, {
            add: { providers: [provideFloatingRootContext(() => context)] }
        });
        const outside = document.createElement('input');
        document.body.append(outside);
        appended.push(outside);
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        open.set(false);
        outside.focus();
        expect(document.activeElement).toBe(outside);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(outside);
    });

    it('returns an interaction-opened popup to its trigger even when native click never focused it', async () => {
        const trigger = document.createElement('button');
        const previous = document.createElement('input');
        document.body.append(trigger, previous);
        appended.push(trigger, previous);
        previous.focus();
        const context = createFloatingRootContext({
            ownerDocument: document,
            open: () => true,
            referenceElement: trigger
        });
        TestBed.overrideComponent(ManagerHost, {
            add: {
                providers: [
                    provideFloatingRootContext(() => context),
                    provideFloatingFocusManagerConfig(() => ({ openInteractionType: () => 'mouse' }))
                ]
            }
        });
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        fixture.componentInstance.enabled.set(false);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(trigger);
    });

    it('returns through the owner policy when a retained reference has become hidden', async () => {
        const trigger = document.createElement('button');
        const previous = document.createElement('input');
        const retained = document.createElement('div');
        retained.append(trigger);
        document.body.append(retained, previous);
        appended.push(retained, previous);
        const context = createFloatingRootContext({
            ownerDocument: document,
            open: () => true,
            referenceElement: trigger
        });
        TestBed.overrideComponent(ManagerHost, {
            add: {
                providers: [
                    provideFloatingRootContext(() => context),
                    provideFloatingFocusManagerConfig(() => ({
                        openInteractionType: () => 'keyboard',
                        previousFocusableElement: () => previous
                    }))
                ]
            }
        });
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.autoDetectChanges();
        await flush();
        retained.hidden = true;
        fixture.componentInstance.enabled.set(false);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(previous);
    });

    it('wraps both Tab edges of a managed modal scope', async () => {
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();
        const first = fixture.componentInstance.a().nativeElement as HTMLElement;
        const last = fixture.componentInstance.b().nativeElement as HTMLElement;
        first.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
        );
        expect(document.activeElement).toBe(last);
        last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(first);
    });

    it('deactivates a retained child scope and resumes its parent', async () => {
        const fixture = TestBed.createComponent(RetainedChildHost);
        fixture.autoDetectChanges();
        await flush();
        const host = fixture.componentInstance;
        expect(host.parent().focusScope.paused()).toBe(false);
        host.childEnabled.set(true);
        await fixture.whenStable();
        await flush();
        expect(host.parent().focusScope.paused()).toBe(true);
        host.childEnabled.set(false);
        await fixture.whenStable();
        await flush();
        expect(host.parent().focusScope.paused()).toBe(false);
        host.childEnabled.set(true);
        await fixture.whenStable();
        await flush();
        expect(host.parent().focusScope.paused()).toBe(true);
        expect(host.child().focusScope.paused()).toBe(false);
    });

    it('does not autofocus a disabled retained view, then returns focus on deactivation', async () => {
        const opener = document.createElement('button');
        document.body.append(opener);
        appended.push(opener);
        opener.focus();
        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.enabled.set(false);
        fixture.autoDetectChanges();
        await flush();
        expect(document.activeElement).toBe(opener);
        fixture.componentInstance.enabled.set(true);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(fixture.componentInstance.a().nativeElement);
        fixture.componentInstance.enabled.set(false);
        await fixture.whenStable();
        await flush();
        expect(document.activeElement).toBe(opener);
    });

    it('preserves programmatic null for focus policy callbacks', async () => {
        TestBed.overrideComponent(ManagerHost, {
            add: {
                providers: [
                    provideFloatingFocusManagerConfig(() => ({
                        openInteractionType: () => null,
                        closeInteractionType: () => null
                    }))
                ]
            }
        });
        const fixture = TestBed.createComponent(ManagerHost);
        const types: unknown[] = [];
        fixture.componentInstance.initialFocus.set((type) => {
            types.push(type);
            return false;
        });
        fixture.componentInstance.returnFocus.set((type) => {
            types.push(type);
            return false;
        });
        fixture.autoDetectChanges();
        await flush();
        fixture.componentInstance.enabled.set(false);
        await fixture.whenStable();
        await flush();
        expect(types.length).toBeGreaterThanOrEqual(2);
        expect(types.every((type) => type === null)).toBe(true);
    });

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
            changeDetection: ChangeDetectionStrategy.Eager,
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

    it('allows a primitive config to trap focus without inerting outside elements', async () => {
        const sibling = document.createElement('div');
        const outside = document.createElement('button');
        document.body.append(sibling, outside);
        appended.push(sibling, outside);

        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
            imports: [RdxFloatingFocusManager],
            providers: [provideFloatingFocusManagerConfig(() => ({ modal: () => true, inert: () => false }))],
            template: `
                <div #scope rdxFloatingFocusManager>
                    <button #a>A</button>
                </div>
            `
        })
        class TrapOnlyHost {
            readonly a = viewChild.required('a', { read: ElementRef });
        }

        const fixture = TestBed.createComponent(TrapOnlyHost);
        fixture.autoDetectChanges();
        await flush();

        const inside = fixture.componentInstance.a().nativeElement as HTMLElement;
        inside.focus();
        outside.focus();

        expect(document.activeElement).toBe(inside);
        expect(sibling.hasAttribute('inert')).toBe(false);
        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
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

    it('inerts outside elements when modal (non-interactive + a11y-hidden in one — finding #4)', async () => {
        const sibling = document.createElement('div');
        document.body.appendChild(sibling);
        appended.push(sibling);

        const fixture = TestBed.createComponent(ManagerHost);
        fixture.componentInstance.modal.set(true);
        fixture.autoDetectChanges();
        await flush();

        // `inert` replaces both the body pointer-lock and the separate `aria-hidden` pass.
        expect(sibling.hasAttribute('inert')).toBe(true);
        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(true); // marker still applied (active)
    });

    it('does not keep additional owned sibling roots from the marker pass', async () => {
        const backdrop = document.createElement('div');
        document.body.appendChild(backdrop);
        appended.push(backdrop);
        const unrelated = document.createElement('div');
        document.body.appendChild(unrelated);
        appended.push(unrelated);

        const context = createFloatingRootContext({ ownerDocument: document, open: () => true });
        context.addFloatingElement(backdrop);

        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
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

        // Backdrop/extra roots are DOM-footprint bookkeeping only, not marker keep-set members.
        expect(backdrop.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
        expect(unrelated.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
    });

    it('tears down marker and inert when the floating context closes, even if enabled stays true', async () => {
        const sibling = document.createElement('div');
        document.body.appendChild(sibling);
        appended.push(sibling);

        const open = signal(true);
        const context = createFloatingRootContext({ ownerDocument: document, open: () => open() });

        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
            imports: [RdxFloatingFocusManager],
            providers: [provideFloatingRootContext(() => context)],
            template: `
                <div #scope [modal]="true" [enabled]="true" rdxFloatingFocusManager></div>
            `
        })
        class OpenHost {
            readonly scope = viewChild.required('scope', { read: ElementRef });
        }

        const fixture = TestBed.createComponent(OpenHost);
        fixture.autoDetectChanges();
        await flush();

        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(true);
        expect(sibling.hasAttribute('inert')).toBe(true);

        open.set(false);
        await flush();

        expect(sibling.hasAttribute(RDX_FLOATING_MARKER)).toBe(false);
        expect(sibling.hasAttribute('inert')).toBe(false);
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
        expect(sibling.hasAttribute('inert')).toBe(false);
    });

    // ─── portal focus bridge / guards ────────────────────────────────────────

    it('mounts focus guards around content and exposes the before-content guard ref', async () => {
        const fixture = TestBed.createComponent(PortalBridgeHost);
        fixture.autoDetectChanges();
        await flush();

        const host = fixture.componentInstance;
        const scope = host.scope().nativeElement as HTMLElement;
        const guards = Array.from(scope.parentElement!.querySelectorAll<HTMLElement>(`[${FOCUS_GUARD_ATTR}]`));

        expect(guards).toHaveLength(2);
        expect(scope.previousElementSibling).toBe(guards[0]);
        expect(scope.nextElementSibling).toBe(guards[1]);
        expect(host.beforeGuard).toBe(guards[0]);

        fixture.destroy();
        await flush();

        expect(host.beforeGuard).toBeNull();
        expect(guards[0].isConnected).toBe(false);
        expect(guards[1].isConnected).toBe(false);
    });

    it('moves focus to previous/next focusable elements when tabbing out of non-modal content', async () => {
        const fixture = TestBed.createComponent(PortalBridgeHost);
        fixture.autoDetectChanges();
        await flush();

        const host = fixture.componentInstance;
        const scope = host.scope().nativeElement as HTMLElement;
        const inside = host.inside().nativeElement as HTMLElement;
        const previous = host.previous().nativeElement as HTMLElement;
        const next = host.next().nativeElement as HTMLElement;
        const [beforeGuard, afterGuard] = Array.from(
            scope.parentElement!.querySelectorAll<HTMLElement>(`[${FOCUS_GUARD_ATTR}]`)
        );

        beforeGuard.dispatchEvent(new FocusEvent('focus', { relatedTarget: inside }));
        expect(document.activeElement).toBe(previous);

        afterGuard.dispatchEvent(new FocusEvent('focus', { relatedTarget: inside }));
        expect(document.activeElement).toBe(next);
    });

    it('keeps getInsideElements targets inside for focus-out containment', async () => {
        const extra = document.createElement('button');
        document.body.appendChild(extra);
        appended.push(extra);

        const fixture = TestBed.createComponent(PortalBridgeHost);
        fixture.componentInstance.extraInside.set(extra);
        fixture.autoDetectChanges();
        await flush();

        let emitted = false;
        fixture.componentInstance.manager().focusOut.subscribe(() => (emitted = true));
        const scope = fixture.componentInstance.scope().nativeElement as HTMLElement;

        scope.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: extra }));

        expect(emitted).toBe(false);
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

    it('does NOT emit when relatedTarget is its own focus guard', async () => {
        const { host, emitted } = await setupManager();
        focusOutTo(host, host.previousElementSibling);
        expect(emitted()).toBe(false);
    });

    it("does emit when focus reaches an unrelated layer's guard", async () => {
        const guard = document.createElement('span');
        guard.setAttribute(FOCUS_GUARD_ATTR, '');
        document.body.appendChild(guard);
        appended.push(guard);

        const { host, emitted } = await setupManager();
        focusOutTo(host, guard);
        expect(emitted()).toBe(true);
    });

    it('ignores document focus changes that did not originate in this layer', async () => {
        const { emitted } = await setupManager();
        const first = document.createElement('button');
        const second = document.createElement('button');
        document.body.append(first, second);
        appended.push(first, second);
        focusOutTo(first, second);
        expect(emitted()).toBe(false);
    });

    it('clears pointer suppression on pointercancel', async () => {
        const { host, emitted } = await setupManager();
        const outside = document.createElement('button');
        document.body.append(outside);
        appended.push(outside);
        document.dispatchEvent(new Event('pointerdown'));
        document.dispatchEvent(new Event('pointercancel'));
        focusOutTo(host, outside);
        expect(emitted()).toBe(true);
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
        it('shared trigger interaction resolves touch and keyboard click open methods', () => {
            const trigger = document.createElement('button');
            const interaction: RdxTriggerInteraction = createRdxTriggerInteraction({
                trigger: () => trigger,
                open: () => false
            });
            const pointerDown = new Event('pointerdown') as PointerEvent;
            Object.defineProperty(pointerDown, 'pointerType', { value: 'touch' });

            interaction.recordPointerDown(pointerDown);

            expect(interaction.clickInteractionType(new MouseEvent('click', { detail: 1 }))).toBe('touch');
            expect(interaction.clickInteractionType(new MouseEvent('click', { detail: 0 }))).toBe('keyboard');
        });

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

    // ─── returnFocus orchestration (ADR 0017 §2 — the manager drives the scope's return target) ───
    describe('returnFocus orchestration', () => {
        async function mount(returnFocus: RdxReturnFocus, opener: HTMLElement) {
            opener.focus(); // the "element focused before open" the scope captures on mount
            const fixture = TestBed.createComponent(ManagerHost);
            // Non-modal: no focus trap, so the post-close `document.activeElement` is determined solely by
            // the return-focus policy (jsdom has no layout, so a real trap's mutation/focus machinery would
            // otherwise muddy it). The manager still owns `returnFocus` regardless of `modal`.
            fixture.componentInstance.modal.set(false);
            fixture.componentInstance.returnFocus.set(returnFocus);
            fixture.autoDetectChanges();
            await flush();
            // Park focus on `<body>` so the return-focus policy acts from a clean, deterministic state.
            (document.activeElement as HTMLElement | null)?.blur();
            return fixture;
        }

        it('returnFocus=true (default) returns focus to the element focused before open', async () => {
            const opener = document.createElement('button');
            document.body.appendChild(opener);
            appended.push(opener);

            const fixture = await mount(true, opener);
            fixture.destroy();
            await flush();

            expect(document.activeElement).toBe(opener);
        });

        it('returnFocus=false does NOT return focus on close', async () => {
            const opener = document.createElement('button');
            document.body.appendChild(opener);
            appended.push(opener);

            const fixture = await mount(false, opener);
            fixture.destroy();
            await flush();

            expect(document.activeElement).not.toBe(opener);
            expect(document.activeElement).toBe(document.body);
        });

        it('returnFocus=<element> returns focus to that element explicitly', async () => {
            const opener = document.createElement('button');
            const target = document.createElement('button');
            document.body.append(opener, target);
            appended.push(opener, target);

            const fixture = await mount(target, opener);
            fixture.destroy();
            await flush();

            expect(document.activeElement).toBe(target);
        });

        it('returnFocus callback receives the close interaction type', async () => {
            const opener = document.createElement('button');
            const keyboardTarget = document.createElement('button');
            document.body.append(opener, keyboardTarget);
            appended.push(opener, keyboardTarget);

            // The manager records `'keyboard'` as the last interaction from the open-time keydown below.
            const fixture = await mount((type) => (type === 'keyboard' ? keyboardTarget : false), opener);
            document.dispatchEvent(new KeyboardEvent('keydown'));
            fixture.destroy();
            await flush();

            expect(document.activeElement).toBe(keyboardTarget);
        });

        for (const value of [null, true] as const) {
            it(`an explicit callback returning ${value} selects the default even after focus moved`, async () => {
                const opener = document.createElement('button');
                const outside = document.createElement('input');
                document.body.append(opener, outside);
                appended.push(opener, outside);
                const callback = vi.fn(() => value);
                const fixture = await mount(callback, opener);
                outside.focus();

                fixture.destroy();
                await flush();

                expect(document.activeElement).toBe(opener);
                expect(callback).toHaveBeenCalledTimes(1);
            });
        }

        for (const policy of [true, () => undefined] as const) {
            it(`preserves moved focus for ${typeof policy === 'function' ? 'an undefined callback result' : 'the default policy'}`, async () => {
                const opener = document.createElement('button');
                const outside = document.createElement('input');
                document.body.append(opener, outside);
                appended.push(opener, outside);
                const fixture = await mount(policy, opener);
                outside.focus();

                fixture.destroy();
                await flush();

                expect(document.activeElement).toBe(outside);
            });
        }
    });
});
