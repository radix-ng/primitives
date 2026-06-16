// @vitest-environment jsdom
import { computed, inject, Injector } from '@angular/core';
import { describe, expect, it } from 'vitest';
import {
    provideFloatingRegistration,
    RDX_FLOATING_REGISTRATION,
    RdxFloatingRegistrationContext
} from '../src/floating/floating-registration';
import { RdxFloatingTree } from '../src/floating/floating-tree';
import { provideFloatingTree, RDX_FLOATING_TREE, resolveFloatingTree } from '../src/floating/provide-floating-tree';

// ─── RdxFloatingRegistrationContext ──────────────────────────────────────────

describe('RdxFloatingRegistrationContext', () => {
    it('starts pending, with tree and node both null', () => {
        const ctx = new RdxFloatingRegistrationContext();
        expect(ctx.status()).toBe('pending');
        expect(ctx.tree()).toBeNull();
        expect(ctx.node()).toBeNull();
    });

    it('register() sets tree and node atomically', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        ctx.register(tree, node);

        expect(ctx.tree()).toBe(tree);
        expect(ctx.node()).toBe(node);
    });

    it('clear() nulls both tree and node atomically', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        ctx.register(tree, node);
        ctx.clear();

        expect(ctx.tree()).toBeNull();
        expect(ctx.node()).toBeNull();
    });

    it('register() enforces node.tree === tree (dev guard)', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const treeA = new RdxFloatingTree();
        const treeB = new RdxFloatingTree();
        const nodeInA = treeA.register({ id: 'n', parent: null, context: null });

        // nodeInA belongs to treeA — passing treeB is a mismatch
        expect(() => ctx.register(treeB, nodeInA)).toThrow(/register.*node\.tree|mismatch/i);
    });

    it('tree and node signals are always consistent (no half-set intermediate)', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        // computed that reads both fields simultaneously
        const consistent = computed(() => {
            const t = ctx.tree();
            const n = ctx.node();
            if (t === null && n === null) return 'null';
            if (t !== null && n !== null && n.tree === t) return 'valid';
            return 'inconsistent';
        });

        expect(consistent()).toBe('null');
        ctx.register(tree, node);
        expect(consistent()).toBe('valid');
        ctx.clear();
        expect(consistent()).toBe('null');
    });

    it('a computed() over the handle re-evaluates when register()/clear() are called', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        // Derived signal — reactively tracks ctx.tree()
        const derivedTree = computed(() => ctx.tree());

        expect(derivedTree()).toBeNull();
        ctx.register(tree, node);
        expect(derivedTree()).toBe(tree);
        ctx.clear();
        expect(derivedTree()).toBeNull();
    });

    // ─── tri-state lifecycle: pending | detached | registered ────────────────

    it('register() transitions status to "registered"', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        ctx.register(tree, node);
        expect(ctx.status()).toBe('registered');
    });

    it('markDetached() resolves to "detached" with no node (node-optional)', () => {
        const ctx = new RdxFloatingRegistrationContext();

        ctx.markDetached();

        expect(ctx.status()).toBe('detached');
        // resolved, but deliberately node-less — readers treat this parent as absent, not pending
        expect(ctx.tree()).toBeNull();
        expect(ctx.node()).toBeNull();
    });

    it('distinguishes pending (still resolving) from detached (resolved, no node)', () => {
        const ctx = new RdxFloatingRegistrationContext();

        // both report node() === null, but the STATUS lets a child decide wait-vs-fallback
        expect(ctx.status()).toBe('pending');
        expect(ctx.node()).toBeNull();

        ctx.markDetached();
        expect(ctx.status()).toBe('detached');
        expect(ctx.node()).toBeNull();
    });

    it('clear() reverts to "pending" (not detached) — the onCleanup phase before re-resolution', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        ctx.register(tree, node);
        ctx.clear();

        expect(ctx.status()).toBe('pending');
        expect(ctx.tree()).toBeNull();
        expect(ctx.node()).toBeNull();
    });

    it('status() is reactive across every transition (pending → registered → pending → detached)', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        const derivedStatus = computed(() => ctx.status());

        expect(derivedStatus()).toBe('pending');
        ctx.register(tree, node);
        expect(derivedStatus()).toBe('registered');
        ctx.clear();
        expect(derivedStatus()).toBe('pending');
        ctx.markDetached();
        expect(derivedStatus()).toBe('detached');
    });
});

// ─── provideFloatingRegistration ──────────────────────────────────────────────

describe('provideFloatingRegistration()', () => {
    it('creates a fresh RdxFloatingRegistrationContext per injector', () => {
        const injA = Injector.create({ providers: [...provideFloatingRegistration()] });
        const injB = Injector.create({ providers: [...provideFloatingRegistration()] });

        const ctxA = injA.get(RDX_FLOATING_REGISTRATION);
        const ctxB = injB.get(RDX_FLOATING_REGISTRATION);

        expect(ctxA).toBeInstanceOf(RdxFloatingRegistrationContext);
        expect(ctxB).toBeInstanceOf(RdxFloatingRegistrationContext);
        expect(ctxA).not.toBe(ctxB);
    });

    it('owner injects the concrete writer; the reader token aliases the SAME instance (one instance, two views)', () => {
        const inj = Injector.create({ providers: [...provideFloatingRegistration()] });

        // The owning directive injects the concrete class — the WRITER side.
        const writer = inj.get(RdxFloatingRegistrationContext);
        // Descendants inject the reader-typed token — `useExisting` resolves to the same instance.
        const reader = inj.get(RDX_FLOATING_REGISTRATION);

        expect(reader).toBe(writer);
        // The reader surface (status/tree/node) is present and reactive; write-protection of the
        // reader view is enforced at the type level (RDX_FLOATING_REGISTRATION is reader-typed).
        expect(reader.status()).toBe('pending');
        expect(reader.tree()).toBeNull();
        expect(reader.node()).toBeNull();
    });

    it('a child injector resolves its own handle (not the parent handle)', () => {
        const parentCtx = new RdxFloatingRegistrationContext();
        const parentInj = Injector.create({
            providers: [{ provide: RDX_FLOATING_REGISTRATION, useValue: parentCtx }]
        });

        const childInj = Injector.create({
            providers: [...provideFloatingRegistration()],
            parent: parentInj
        });

        const childCtx = childInj.get(RDX_FLOATING_REGISTRATION);
        expect(childCtx).not.toBe(parentCtx);
        expect(childCtx.tree()).toBeNull();
    });

    it('inject(RDX_FLOATING_REGISTRATION, { skipSelf }) from child resolves to the parent handle', () => {
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });
        const parentCtx = new RdxFloatingRegistrationContext();
        parentCtx.register(tree, node);

        const parentInj = Injector.create({
            providers: [{ provide: RDX_FLOATING_REGISTRATION, useValue: parentCtx }]
        });

        const childInj = Injector.create({
            providers: [...provideFloatingRegistration()],
            parent: parentInj
        });

        // skipSelf from the child context reaches the parent's handle
        const parentFromChild = childInj.runInContext(() =>
            inject(RDX_FLOATING_REGISTRATION, { optional: true, skipSelf: true })
        );

        expect(parentFromChild).toBe(parentCtx);
        expect(parentFromChild?.tree()).toBe(tree);
        expect(parentFromChild?.node()).toBe(node);
    });

    it('a grandchild context inherits the child handle (not the grandparent)', () => {
        const tree = new RdxFloatingTree();
        const parentNode = tree.register({ id: 'parent', parent: null, context: null });
        const parentCtx = new RdxFloatingRegistrationContext();
        parentCtx.register(tree, parentNode);

        const childNode = tree.register({ id: 'child', parent: parentNode, context: null });
        const childCtx = new RdxFloatingRegistrationContext();
        childCtx.register(tree, childNode);

        const parentInj = Injector.create({
            providers: [{ provide: RDX_FLOATING_REGISTRATION, useValue: parentCtx }]
        });
        const childInj = Injector.create({
            providers: [{ provide: RDX_FLOATING_REGISTRATION, useValue: childCtx }],
            parent: parentInj
        });
        const grandchildInj = Injector.create({ providers: [], parent: childInj });

        // grandchild sees child's handle (nearest ancestor), not grandparent's
        const nearest = grandchildInj.get(RDX_FLOATING_REGISTRATION);
        expect(nearest).toBe(childCtx);
        expect(nearest.node()).toBe(childNode);

        // with skipSelf: grandchild context sees parent (grandchild has no own handle)
        const withSkipSelf = grandchildInj.runInContext(() =>
            inject(RDX_FLOATING_REGISTRATION, { optional: true, skipSelf: true })
        );
        // grandchild has no own handle, so skipSelf reaches child (the nearest parent that has one)
        expect(withSkipSelf).toBe(childCtx);
    });
});

// ─── resolveFloatingTree() ───────────────────────────────────────────────────

describe('resolveFloatingTree()', () => {
    it('returns the explicit externalTree, even when an ambient RDX_FLOATING_TREE is present', () => {
        const ambient = Injector.create({ providers: [provideFloatingTree()] });
        const ambientTree = ambient.get(RDX_FLOATING_TREE);
        const external = new RdxFloatingTree();

        const result = ambient.runInContext(() => resolveFloatingTree(external));
        expect(result).toBe(external);
        expect(result).not.toBe(ambientTree);
    });

    it('falls back to the ambient RDX_FLOATING_TREE when no externalTree is provided', () => {
        const injector = Injector.create({ providers: [provideFloatingTree()] });
        const ambientTree = injector.get(RDX_FLOATING_TREE);

        const result = injector.runInContext(() => resolveFloatingTree());
        expect(result).toBe(ambientTree);
    });

    it('returns null when neither externalTree nor an ambient token is available', () => {
        const injector = Injector.create({ providers: [] });
        const result = injector.runInContext(() => resolveFloatingTree());
        expect(result).toBeNull();
    });

    it('null externalTree falls back to the ambient token (null does not win over ambient)', () => {
        const injector = Injector.create({ providers: [provideFloatingTree()] });
        const ambientTree = injector.get(RDX_FLOATING_TREE);

        const result = injector.runInContext(() => resolveFloatingTree(null));
        expect(result).toBe(ambientTree);
    });
});

// ─── handle propagation contract (Phase 1 design) ────────────────────────────

describe('Handle propagation — Phase 1 design contract', () => {
    it('a directive filling its handle propagates tree+node reactively to all readers', () => {
        const ctx = new RdxFloatingRegistrationContext();
        const tree = new RdxFloatingTree();
        const node = tree.register({ id: 'root', parent: null, context: null });

        // Two independent derived signals — both should update together
        const derivedTree = computed(() => ctx.tree());
        const derivedNode = computed(() => ctx.node());

        expect(derivedTree()).toBeNull();
        expect(derivedNode()).toBeNull();

        ctx.register(tree, node);
        expect(derivedTree()).toBe(tree);
        expect(derivedNode()).toBe(node);
    });

    it('clearing one handle does not affect an independent sibling handle', () => {
        const treeA = new RdxFloatingTree();
        const treeB = new RdxFloatingTree();
        const ctxA = new RdxFloatingRegistrationContext();
        const ctxB = new RdxFloatingRegistrationContext();
        const nodeA = treeA.register({ id: 'a', parent: null, context: null });
        const nodeB = treeB.register({ id: 'b', parent: null, context: null });

        ctxA.register(treeA, nodeA);
        ctxB.register(treeB, nodeB);

        ctxA.clear();

        expect(ctxA.tree()).toBeNull();
        expect(ctxB.tree()).toBe(treeB); // unaffected
    });

    it('the parent node from parentReg.node() is available to the child for tree.register()', () => {
        const tree = new RdxFloatingTree();
        const parentCtx = new RdxFloatingRegistrationContext();
        const parentNode = tree.register({ id: 'parent', parent: null, context: null });
        parentCtx.register(tree, parentNode);

        // Child reads parent's node and registers with it as parent
        const parentNodeRef = parentCtx.node();
        const childNode = tree.register({ id: 'child', parent: parentNodeRef, context: null });

        expect(childNode.parent).toBe(parentNode);
        expect(tree.ancestors(childNode)).toEqual([parentNode]);
    });
});
