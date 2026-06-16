// @vitest-environment jsdom
import {
    createEnvironmentInjector,
    EnvironmentInjector,
    PLATFORM_ID,
    runInInjectionContext,
    signal
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    createFloatingRootContext,
    RdxFloatingNode,
    RdxFloatingRootContext,
    RdxFloatingTree
} from '@radix-ng/primitives/core';
import { RDX_FLOATING_MARKER } from '@radix-ng/primitives/floating-focus-manager';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RdxDismiss, RdxDismissProps, RdxDismissReason } from '../src/dismiss';

/** Drain microtasks (focus-out defers two) and the deferred `pointerdown` attach (a `setTimeout(0)`). */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('RdxDismiss', () => {
    const cleanups: Array<() => void> = [];
    const appended: Element[] = [];

    function el(tag = 'div'): HTMLElement {
        const node = document.createElement(tag);
        document.body.appendChild(node);
        appended.push(node);
        return node;
    }

    function context(open: () => boolean, floatingElement: HTMLElement | null = null): RdxFloatingRootContext {
        return createFloatingRootContext({ ownerDocument: document, open, floatingElement });
    }

    /** Build a capability inside a destroyable child injector; returns it plus its `destroy`. */
    function build(
        ctx: RdxFloatingRootContext,
        node: () => RdxFloatingNode | null,
        onDismiss: (reason: RdxDismissReason, event: Event) => void,
        config: RdxDismissProps = {}
    ): RdxDismiss {
        const injector = createEnvironmentInjector(
            [{ provide: PLATFORM_ID, useValue: 'browser' }],
            TestBed.inject(EnvironmentInjector)
        );
        cleanups.push(() => injector.destroy());
        return runInInjectionContext(injector, () => new RdxDismiss(ctx, node, { onDismiss, ...config }));
    }

    beforeEach(() => TestBed.resetTestingModule());

    afterEach(() => {
        cleanups.splice(0).forEach((fn) => fn());
        appended.splice(0).forEach((node) => node.remove());
    });

    // ─── Escape ──────────────────────────────────────────────────────────────

    it('dismisses on Escape when active', () => {
        const onDismiss = vi.fn();
        build(
            context(() => true),
            () => null,
            onDismiss
        );

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(onDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
    });

    it('does not dismiss on Escape when the popup is closed (inactive)', () => {
        const open = signal(false);
        const onDismiss = vi.fn();
        build(
            context(() => open()),
            () => null,
            onDismiss
        );

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('does not dismiss on Escape when escapeKey is disabled', () => {
        const onDismiss = vi.fn();
        build(
            context(() => true),
            () => null,
            onDismiss,
            { escapeKey: () => false }
        );

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('onEscapeKeyDown can preventDefault to veto the dismissal', () => {
        const onDismiss = vi.fn();
        build(
            context(() => true),
            () => null,
            onDismiss,
            {
                onEscapeKeyDown: (event) => event.preventDefault()
            }
        );

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('Escape yields to an open descendant (hasBlockingChild — only the deepest layer closes)', () => {
        const tree = new RdxFloatingTree();
        const parentCtx = context(() => true);
        const childOpen = signal(true);
        const childCtx = context(() => childOpen());
        const parentNode = tree.register({ id: 'parent', parent: null, context: parentCtx });
        tree.register({ id: 'child', parent: parentNode, context: childCtx });

        const onDismiss = vi.fn();
        build(parentCtx, () => parentNode, onDismiss);

        // child open → parent yields
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onDismiss).not.toHaveBeenCalled();

        // child closed → parent now owns Escape
        childOpen.set(false);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
    });

    // ─── outside press ─────────────────────────────────────────────────────────

    it('dismisses on a pointer press outside the layer', async () => {
        const onDismiss = vi.fn();
        const floating = el();
        build(
            context(() => true, floating),
            () => null,
            onDismiss
        );
        await flush(); // let the deferred pointerdown listener attach

        el('button').dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('outsidePress receives the press event and can veto per target (event-aware predicate)', async () => {
        const onDismiss = vi.fn();
        const allowed = el('button');
        const blocked = el('button');
        build(
            context(() => true, el()),
            () => null,
            onDismiss,
            { outsidePress: (event) => event.target === allowed }
        );
        await flush();

        blocked.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();

        allowed.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('outsidePressEvent "intentional" closes on click, not on the bare pointerdown', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true, el()),
            () => null,
            onDismiss,
            { outsidePressEvent: () => 'intentional' }
        );
        await flush();

        const target = el('button');
        target.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled();

        target.dispatchEvent(new Event('click', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    // ─── Touch outside-press hardening (#7) ──────────────────────────────────
    function touchEvent(type: string, x: number, y: number): Event {
        const event = new Event(type, { bubbles: true });
        Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: y }] });
        return event;
    }

    it('outsidePressEvent map resolves per pointer type (mouse → intentional, touch → sloppy)', async () => {
        const onDismiss = vi.fn();
        const target = el('button');
        build(
            context(() => true, el()),
            () => null,
            onDismiss,
            { outsidePressEvent: () => ({ mouse: 'intentional', touch: 'sloppy' }) }
        );
        await flush();

        // mouse → intentional → a bare pointerdown does not close (waits for the click).
        const mouse = new Event('pointerdown', { bubbles: true });
        Object.defineProperty(mouse, 'pointerType', { value: 'mouse' });
        target.dispatchEvent(mouse);
        expect(onDismiss).not.toHaveBeenCalled();

        // touch → sloppy → a tap closes (via the touch machine + synthetic mousedown).
        target.dispatchEvent(touchEvent('touchstart', 20, 20));
        target.dispatchEvent(touchEvent('touchend', 20, 20));
        target.dispatchEvent(new Event('mousedown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('a touch sloppy outside-press does NOT dismiss on the initial pointerdown', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );
        await flush();

        const touch = new Event('pointerdown', { bubbles: true });
        Object.defineProperty(touch, 'pointerType', { value: 'touch' });
        el('button').dispatchEvent(touch);

        expect(onDismiss).not.toHaveBeenCalled(); // decided by the touch machine, not pointerdown
    });

    it('a touch tap (touchstart → touchend → synthetic mousedown) dismisses', async () => {
        const onDismiss = vi.fn();
        const target = el('button');
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );
        await flush();

        target.dispatchEvent(touchEvent('touchstart', 20, 20));
        target.dispatchEvent(touchEvent('touchend', 20, 20));
        expect(onDismiss).not.toHaveBeenCalled(); // a plain tap waits for the synthetic mousedown

        target.dispatchEvent(new Event('mousedown', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('a touch swipe away (> 10px) dismisses immediately on touchmove', async () => {
        const onDismiss = vi.fn();
        const target = el('button');
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );
        await flush();

        target.dispatchEvent(touchEvent('touchstart', 0, 0));
        target.dispatchEvent(touchEvent('touchmove', 30, 30)); // distance > 10
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('a real mouse press is unaffected — still dismisses on pointerdown (no touch state)', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );
        await flush();

        const mouse = new Event('pointerdown', { bubbles: true });
        Object.defineProperty(mouse, 'pointerType', { value: 'mouse' });
        el('button').dispatchEvent(mouse);
        // The synthetic-mousedown handler is a no-op without a touch in progress → single dismiss.
        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('does not dismiss when the press lands inside the floating element', async () => {
        const onDismiss = vi.fn();
        const floating = el();
        const inner = document.createElement('span');
        floating.appendChild(inner);
        build(
            context(() => true, floating),
            () => null,
            onDismiss
        );
        await flush();

        inner.dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('does not dismiss when the press lands on a registered trigger', async () => {
        const onDismiss = vi.fn();
        const ctx = context(() => true);
        const trigger = el('button');
        ctx.triggers.add(trigger);
        build(ctx, () => null, onDismiss);
        await flush();

        trigger.dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('does not dismiss when the press lands inside a registered branch', async () => {
        const onDismiss = vi.fn();
        const branch = el();
        const cap = build(
            context(() => true),
            () => null,
            onDismiss
        );
        cap.branches.add(branch);
        await flush();

        branch.dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('ignores an outside press inside a marked inert subtree (third-party injected guard)', async () => {
        const onDismiss = vi.fn();
        const marked = el();
        const injected = document.createElement('button');
        marked.setAttribute(RDX_FLOATING_MARKER, '');
        marked.appendChild(injected);
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );
        await flush();

        injected.dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('counts an open descendant popup as inside (logical containment survives portaling)', async () => {
        const tree = new RdxFloatingTree();
        const parentCtx = context(() => true, el());
        const childFloating = el(); // a portaled child popup, NOT a DOM descendant of the parent
        const childCtx = context(() => true, childFloating);
        const parentNode = tree.register({ id: 'parent', parent: null, context: parentCtx });
        tree.register({ id: 'child', parent: parentNode, context: childCtx });

        const onDismiss = vi.fn();
        build(parentCtx, () => parentNode, onDismiss);
        await flush();

        childFloating.dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('outside-press closes the whole stack — a parent with an open child still dismisses', async () => {
        const tree = new RdxFloatingTree();
        const parentCtx = context(() => true, el());
        const childCtx = context(() => true, el());
        const parentNode = tree.register({ id: 'parent', parent: null, context: parentCtx });
        tree.register({ id: 'child', parent: parentNode, context: childCtx });

        const onDismiss = vi.fn();
        build(parentCtx, () => parentNode, onDismiss);
        await flush();

        el('button').dispatchEvent(new Event('pointerdown', { bubbles: true }));

        // unlike Escape, outside-press does NOT yield to the open child (Base UI outsidePressBubbles=true)
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    // ─── focus outside ───────────────────────────────────────────────────────

    it('dismisses when focus moves outside the layer (deferred)', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );

        el('button').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await flush();

        expect(onDismiss).toHaveBeenCalledWith('focus-outside', expect.any(FocusEvent));
    });

    it('does not dismiss when focus stays inside the layer', async () => {
        const onDismiss = vi.fn();
        const floating = el();
        const inner = document.createElement('input');
        floating.appendChild(inner);
        build(
            context(() => true, floating),
            () => null,
            onDismiss
        );

        inner.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await flush();

        expect(onDismiss).not.toHaveBeenCalled();
    });

    // ─── Phase 2: bubbles policy & propagation ───────────────────────────────

    it('escapeKeyBubbles=true re-emits Escape to the parent (closeParentOnEsc — both close)', () => {
        const tree = new RdxFloatingTree();
        const parentCtx = context(() => true);
        const childCtx = context(() => true);
        const parentNode = tree.register({ id: 'parent', parent: null, context: parentCtx });
        const childNode = tree.register({ id: 'child', parent: parentNode, context: childCtx });

        const parentDismiss = vi.fn();
        const childDismiss = vi.fn();
        build(parentCtx, () => parentNode, parentDismiss);
        build(childCtx, () => childNode, childDismiss, { escapeKeyBubbles: () => true });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        // the bubbling child no longer blocks the parent — both close
        expect(childDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
        expect(parentDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
    });

    it('a child capability with default (non-bubbling) Escape blocks the parent', () => {
        const tree = new RdxFloatingTree();
        const parentCtx = context(() => true);
        const childCtx = context(() => true);
        const parentNode = tree.register({ id: 'parent', parent: null, context: parentCtx });
        const childNode = tree.register({ id: 'child', parent: parentNode, context: childCtx });

        const parentDismiss = vi.fn();
        const childDismiss = vi.fn();
        build(parentCtx, () => parentNode, parentDismiss);
        build(childCtx, () => childNode, childDismiss); // default escapeKeyBubbles = false

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(childDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
        expect(parentDismiss).not.toHaveBeenCalled(); // parent yields to the non-bubbling child
    });

    it('a non-bubbling Escape owner stops propagation (the key does not reach app handlers)', () => {
        const inner = el();
        const appHandler = vi.fn();
        document.addEventListener('keydown', appHandler); // bubble-phase app listener
        cleanups.push(() => document.removeEventListener('keydown', appHandler));

        build(
            context(() => true),
            () => null,
            vi.fn()
        );

        inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(appHandler).not.toHaveBeenCalled();
    });

    it('escapeKeyBubbles=true lets the key reach app handlers (no stopPropagation)', () => {
        const inner = el();
        const appHandler = vi.fn();
        document.addEventListener('keydown', appHandler);
        cleanups.push(() => document.removeEventListener('keydown', appHandler));

        build(
            context(() => true),
            () => null,
            vi.fn(),
            { escapeKeyBubbles: () => true }
        );

        inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(appHandler).toHaveBeenCalled();
    });

    it('outsidePressBubbles=false yields to a non-bubbling open child (only the deepest closes)', async () => {
        const tree = new RdxFloatingTree();
        const parentCtx = context(() => true, el());
        const childCtx = context(() => true, el());
        const parentNode = tree.register({ id: 'parent', parent: null, context: parentCtx });
        const childNode = tree.register({ id: 'child', parent: parentNode, context: childCtx });

        const parentDismiss = vi.fn();
        const childDismiss = vi.fn();
        build(parentCtx, () => parentNode, parentDismiss, { outsidePressBubbles: () => false });
        build(childCtx, () => childNode, childDismiss, { outsidePressBubbles: () => false });
        await flush();

        el('button').dispatchEvent(new Event('pointerdown', { bubbles: true }));

        expect(childDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
        expect(parentDismiss).not.toHaveBeenCalled(); // parent yields to the non-bubbling child
    });

    // ─── Phase 3: press / IME hardening ──────────────────────────────────────

    it('ignores a non-primary mouse button (only a primary press dismisses)', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true, el()),
            () => null,
            onDismiss
        );
        await flush();

        el('button').dispatchEvent(new MouseEvent('pointerdown', { button: 2, bubbles: true }));

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('ignores Escape while an IME composition is active', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true),
            () => null,
            onDismiss
        );

        document.dispatchEvent(new Event('compositionstart'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onDismiss).not.toHaveBeenCalled();

        document.dispatchEvent(new Event('compositionend'));
        await flush(); // compositionend clears `isComposing` on the next tick
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onDismiss).toHaveBeenCalledWith('escape-key', expect.any(KeyboardEvent));
    });

    it('intentional mode dismisses on click, not on pointerdown', async () => {
        const onDismiss = vi.fn();
        build(
            context(() => true, el()),
            () => null,
            onDismiss,
            { outsidePressEvent: () => 'intentional' }
        );
        await flush();

        const outside = el('button');
        outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        expect(onDismiss).not.toHaveBeenCalled(); // waits for the full press (click)

        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    it('intentional mode suppresses the outside click when the press started inside (drag-out)', async () => {
        const onDismiss = vi.fn();
        const floating = el();
        build(
            context(() => true, floating),
            () => null,
            onDismiss,
            { outsidePressEvent: () => 'intentional' }
        );
        await flush();

        floating.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })); // press starts inside
        el('button').dispatchEvent(new MouseEvent('click', { bubbles: true })); // drag-out + release

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('pointercancel resets press-start tracking (a cancelled inside press no longer suppresses)', async () => {
        const onDismiss = vi.fn();
        const floating = el();
        build(
            context(() => true, floating),
            () => null,
            onDismiss,
            { outsidePressEvent: () => 'intentional' }
        );
        await flush();

        floating.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })); // press inside...
        document.dispatchEvent(new Event('pointercancel')); // ...cancelled
        el('button').dispatchEvent(new MouseEvent('click', { bubbles: true })); // a later, unrelated outside click

        expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(Event));
    });

    // ─── teardown ──────────────────────────────────────────────────────────────

    it('stops listening once its injector is destroyed', () => {
        const onDismiss = vi.fn();
        const injector = createEnvironmentInjector(
            [{ provide: PLATFORM_ID, useValue: 'browser' }],
            TestBed.inject(EnvironmentInjector)
        );
        runInInjectionContext(
            injector,
            () =>
                new RdxDismiss(
                    context(() => true),
                    () => null,
                    { onDismiss }
                )
        );

        injector.destroy();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(onDismiss).not.toHaveBeenCalled();
    });
});
