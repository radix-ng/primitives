// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { createFloatingRootContext, RdxFloatingRootContext } from '../src/floating/floating-root-context';
import { RdxFloatingNode, RdxFloatingTree } from '../src/floating/floating-tree';

function context(open = false, ownerDocument: Document = document): RdxFloatingRootContext {
    return new RdxFloatingRootContext({ ownerDocument, open: () => open });
}

/** Registers a node wrapping a root context with a constant open-state. */
function register(tree: RdxFloatingTree, id: string, parent: RdxFloatingNode | null, open = false): RdxFloatingNode {
    return tree.register({ id, parent, context: context(open) });
}

describe('RdxFloatingTree', () => {
    let tree: RdxFloatingTree;

    beforeEach(() => {
        tree = new RdxFloatingTree();
    });

    it('unregisters a node without removing its children, and traversal ignores the ghost parent', () => {
        const root = register(tree, 'root', null, true);
        const child = register(tree, 'child', root, true);

        expect(tree.all).toHaveLength(2);

        tree.unregister(root);

        // child stays registered and keeps the raw parent identity...
        expect(tree.all).toEqual([child]);
        expect(child.parent).toBe(root);
        // ...but the unregistered parent is no longer a traversable ancestor (Base UI parity)
        expect(tree.ancestors(child)).toEqual([]);
    });

    it('truncates ancestry at an unregistered middle node (does not skip to the grandparent)', () => {
        const grandparent = register(tree, 'grandparent', null, true);
        const parent = register(tree, 'parent', grandparent, true);
        const child = register(tree, 'child', parent, true);

        expect(tree.ancestors(child)).toEqual([parent, grandparent]);

        tree.unregister(parent);

        // chain breaks at the removed parent — the grandparent is NOT reached
        expect(tree.ancestors(child)).toEqual([]);
    });

    describe('children()', () => {
        it('returns transitive children in registration order', () => {
            const root = register(tree, 'root', null, true);
            const a = register(tree, 'a', root, true);
            const b = register(tree, 'b', root, true);
            const aa = register(tree, 'aa', a, true);

            expect(tree.children(root)).toEqual([a, aa, b]);
        });

        it('with onlyOpen:true excludes closed nodes from the result', () => {
            const root = register(tree, 'root', null, true);
            register(tree, 'closed', root, false);
            const open = register(tree, 'open', root, true);

            expect(tree.children(root, { onlyOpen: true })).toEqual([open]);
        });

        it('never aborts recursion at a closed node — a closed parent does not hide an open grandchild', () => {
            const root = register(tree, 'root', null, true);
            const closedParent = register(tree, 'closed-parent', root, false);
            const openGrandchild = register(tree, 'open-grandchild', closedParent, true);

            // onlyOpen filters the *result* but still descends into the closed node
            expect(tree.children(root, { onlyOpen: true })).toEqual([openGrandchild]);
            // onlyOpen:false keeps both
            expect(tree.children(root, { onlyOpen: false })).toEqual([closedParent, openGrandchild]);
        });

        it('a contextless node (context === null) is treated as closed by onlyOpen:true', () => {
            const root = register(tree, 'root', null, true);
            const contextless = tree.register({ id: 'contextless', parent: root, context: null });

            expect(tree.children(root, { onlyOpen: true })).toEqual([]);
            expect(tree.children(root, { onlyOpen: false })).toEqual([contextless]);
        });
    });

    describe('ancestors()', () => {
        it('walks the logical parent chain nearest-first', () => {
            const root = register(tree, 'root', null);
            const a = register(tree, 'a', root);
            const aa = register(tree, 'aa', a);

            expect(tree.ancestors(aa)).toEqual([a, root]);
            expect(tree.ancestors(root)).toEqual([]);
        });
    });

    describe('deepestOpen()', () => {
        it('returns the deepest open descendant (topmost within the tree)', () => {
            const root = register(tree, 'root', null, true);
            const a = register(tree, 'a', root, true);
            const aa = register(tree, 'aa', a, true);

            expect(tree.deepestOpen(root)).toBe(aa);
        });

        it('ignores closed branches when choosing the deepest', () => {
            const root = register(tree, 'root', null, true);
            const shallowOpen = register(tree, 'shallow', root, true);
            const deepClosedParent = register(tree, 'deep-closed', root, false);
            register(tree, 'deep-open', deepClosedParent, true);

            // the deep branch is gated behind a closed node, so the shallow open node wins
            expect(tree.deepestOpen(root)).toBe(shallowOpen);
        });

        it('returns null when there is no open descendant', () => {
            const root = register(tree, 'root', null, true);
            register(tree, 'closed', root, false);

            expect(tree.deepestOpen(root)).toBeNull();
        });
    });

    describe('open() lives on the context and drives traversal', () => {
        it('reflects a live open-state accessor on the context', () => {
            const root = register(tree, 'root', null, true);
            let childOpen = false;
            const child = tree.register({
                id: 'child',
                parent: root,
                context: new RdxFloatingRootContext({ ownerDocument: document, open: () => childOpen })
            });

            expect(tree.children(root, { onlyOpen: true })).toEqual([]);

            childOpen = true;
            expect(tree.children(root, { onlyOpen: true })).toEqual([child]);
            expect(tree.deepestOpen(root)).toBe(child);
        });
    });

    describe('setContext()', () => {
        it('associates and clears a context after registration (null → context → null)', () => {
            const root = register(tree, 'root', null, true);
            const node = tree.register({ id: 'late', parent: root, context: null });

            expect(tree.children(root, { onlyOpen: true })).toEqual([]);

            tree.setContext(node, context(true));
            expect(tree.children(root, { onlyOpen: true })).toEqual([node]);

            tree.setContext(node, null);
            expect(tree.children(root, { onlyOpen: true })).toEqual([]);
        });

        it('rejects a context whose document differs from a context-bearing ancestor', () => {
            const root = register(tree, 'root', null, true);
            const node = tree.register({ id: 'late', parent: root, context: null });
            const otherDoc = document.implementation.createHTMLDocument('other');

            expect(() => tree.setContext(node, context(true, otherDoc))).toThrow(/ownerDocument/i);
        });

        it('validates owner-document against context-bearing descendants, not just ancestors', () => {
            const otherDoc = document.implementation.createHTMLDocument('other');
            // a contextless root can temporarily bridge two documents at registration time...
            const root = tree.register({ id: 'root', parent: null, context: null });
            register(tree, 'a', root, true); // document
            tree.register({ id: 'b', parent: root, context: context(true, otherDoc) }); // otherDoc

            // ...but giving that root a context surfaces the conflict with the `otherDoc` descendant.
            expect(() => tree.setContext(root, context(true, document))).toThrow(/ownerDocument/i);
        });
    });

    describe('setParent()', () => {
        it('reparents a node', () => {
            const root = register(tree, 'root', null);
            const a = register(tree, 'a', root);
            const detached = register(tree, 'detached', null);

            tree.setParent(detached, a);

            expect(detached.parent).toBe(a);
            expect(tree.children(a, { onlyOpen: false })).toContain(detached);
        });

        it('rejects an ancestry cycle', () => {
            const root = register(tree, 'root', null);
            const a = register(tree, 'a', root);

            expect(() => tree.setParent(root, a)).toThrow(/cycle/i);
        });

        it('validates the WHOLE subtree against the new ancestor, not just the first descendant', () => {
            const otherDoc = document.implementation.createHTMLDocument('other');
            const newParent = register(tree, 'new-parent', null, true); // document

            // a detached contextless node bridging two documents in its subtree
            const detached = tree.register({ id: 'detached', parent: null, context: null });
            register(tree, 'd1', detached, true); // document (first descendant — matches newParent)
            tree.register({ id: 'd2', parent: detached, context: context(true, otherDoc) }); // otherDoc

            // first descendant matches, but the second conflicts — must still be rejected
            expect(() => tree.setParent(detached, newParent)).toThrow(/ownerDocument/i);
        });
    });

    describe('encapsulation', () => {
        it('exposes parent/context as read-only getters — mutate only through the tree', () => {
            const root = register(tree, 'root', null, true);
            const node = register(tree, 'child', root, true);

            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), 'parent');
            expect(typeof descriptor?.get).toBe('function');
            expect(descriptor?.set).toBeUndefined();

            const other = register(tree, 'other', null, true);
            tree.setParent(node, other);
            expect(node.parent).toBe(other);
        });

        it('cannot be constructed directly — only via tree.register', () => {
            // bypass the compile-time construction-key requirement to prove the runtime guard
            const Node = RdxFloatingNode as unknown as new (...args: unknown[]) => RdxFloatingNode;
            expect(() => new Node('fake', 'id', tree, null, null)).toThrow(/register/i);
        });
    });

    describe('node ownership', () => {
        it('rejects mutating or traversing a node from another tree', () => {
            const otherTree = new RdxFloatingTree();
            const foreign = otherTree.register({ id: 'foreign', parent: null, context: context(true) });

            expect(() => tree.setParent(foreign, null)).toThrow(/belong/i);
            expect(() => tree.setContext(foreign, context())).toThrow(/belong/i);
            expect(() => tree.children(foreign)).toThrow(/belong/i);
            expect(() => tree.ancestors(foreign)).toThrow(/belong/i);
            expect(() => tree.deepestOpen(foreign)).toThrow(/belong/i);
        });

        it('rejects operating on an already-unregistered node', () => {
            const node = register(tree, 'node', null, true);
            tree.unregister(node);

            expect(() => tree.children(node)).toThrow(/unregistered|belong/i);
            expect(() => tree.unregister(node)).toThrow(/unregistered|belong/i);
        });

        it('rejects registering or reparenting under an unregistered parent', () => {
            const parent = register(tree, 'parent', null, true);
            const child = register(tree, 'child', null, true);
            tree.unregister(parent);

            expect(() => tree.register({ id: 'late', parent, context: context() })).toThrow(/registered/i);
            expect(() => tree.setParent(child, parent)).toThrow(/registered/i);
        });
    });

    describe('invariants', () => {
        it('rejects a parent from a different tree', () => {
            const otherTree = new RdxFloatingTree();
            const foreignParent = otherTree.register({ id: 'foreign', parent: null, context: context() });

            expect(() => tree.register({ id: 'child', parent: foreignParent, context: context() })).toThrow(
                /same tree/i
            );
        });

        it('rejects a parent whose context is in a different ownerDocument', () => {
            const parent = register(tree, 'root', null);
            const otherDoc = document.implementation.createHTMLDocument('other');

            expect(() => tree.register({ id: 'child', parent, context: context(false, otherDoc) })).toThrow(
                /ownerDocument/i
            );
        });
    });
});

describe('RdxFloatingRootContext', () => {
    it('exposes elements read-only behind validated setters', () => {
        const ctx = new RdxFloatingRootContext({ ownerDocument: document, open: () => true });
        const floating = document.createElement('div');
        const reference = document.createElement('button');

        ctx.setFloatingElement(floating);
        ctx.setReferenceElement(reference);

        expect(ctx.floatingElement).toBe(floating);
        expect(ctx.referenceElement).toBe(reference);
    });

    it('rejects a floating element from a different document', () => {
        const ctx = new RdxFloatingRootContext({ ownerDocument: document });
        const foreign = document.implementation.createHTMLDocument('other').createElement('div');

        expect(() => ctx.setFloatingElement(foreign)).toThrow(/ownerDocument/i);
    });

    it('createFloatingRootContext builds a node-optional context (getEmptyRootContext analog)', () => {
        const ctx = createFloatingRootContext({ ownerDocument: document });

        // usable without ever registering a tree node
        expect(ctx.open()).toBe(false);
        expect(ctx.floatingElement).toBeNull();

        const trigger = document.createElement('button');
        ctx.triggers.add(trigger);
        expect(ctx.triggers.contains(trigger)).toBe(true);
    });

    describe('per-context triggers, not tree-wide', () => {
        it('each context owns its own trigger registry', () => {
            const a = createFloatingRootContext({ ownerDocument: document });
            const b = createFloatingRootContext({ ownerDocument: document });
            const trigger = document.createElement('button');

            a.triggers.add(trigger);

            expect(a.triggers.contains(trigger)).toBe(true);
            expect(b.triggers.contains(trigger)).toBe(false);
        });

        it('matches a trigger exactly and by ancestor', () => {
            const ctx = createFloatingRootContext({ ownerDocument: document });
            const trigger = document.createElement('button');
            const inner = document.createElement('span');
            trigger.appendChild(inner);

            ctx.triggers.add(trigger);

            expect(ctx.triggers.hasElement(trigger)).toBe(true);
            expect(ctx.triggers.hasElement(inner)).toBe(false);
            expect(ctx.triggers.hasMatchingElement(inner)).toBe(true);
            expect(ctx.triggers.contains(inner)).toBe(true);
        });

        it('matches a trigger element from another document by reference (cross-realm-safe)', () => {
            // Membership is by reference, not `instanceof Element`, so a trigger registered from a
            // different document/realm (iframe) still matches. (Full cross-realm `instanceof` divergence
            // only reproduces in a real browser; jsdom shares one realm.)
            const otherDoc = document.implementation.createHTMLDocument('iframe');
            const foreignTrigger = otherDoc.createElement('button');
            const ctx = createFloatingRootContext({ ownerDocument: otherDoc });

            ctx.triggers.add(foreignTrigger);

            expect(ctx.triggers.hasElement(foreignTrigger)).toBe(true);
            expect(ctx.triggers.contains(foreignTrigger)).toBe(true);
            expect(ctx.triggers.hasElement(document.createElement('button'))).toBe(false);
        });
    });
});

describe('RdxFloatingTree events', () => {
    it('exposes a typed event channel private to the tree', () => {
        const tree = new RdxFloatingTree();
        const received: { open: boolean }[] = [];
        const listener = (data: { open: boolean }) => received.push(data);

        tree.events.on('openchange', listener);
        tree.events.emit('openchange', { open: true });
        tree.events.off('openchange', listener);
        tree.events.emit('openchange', { open: false });

        expect(received).toEqual([{ open: true }]);
    });
});
