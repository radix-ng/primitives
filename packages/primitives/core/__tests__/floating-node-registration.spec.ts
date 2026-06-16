// @vitest-environment jsdom
import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RdxFloatingNodeRegistration } from '../src/floating/floating-node-registration';
import { createFloatingRootContext, RdxFloatingRootContext } from '../src/floating/floating-root-context';
import { RdxFloatingParentOverride, RdxFloatingTree } from '../src/floating/floating-tree';
import {
    provideFloatingRootContext,
    provideFloatingTree,
    RDX_FLOATING_TREE
} from '../src/floating/provide-floating-tree';

describe('RdxFloatingNodeRegistration', () => {
    beforeEach(() => TestBed.resetTestingModule());

    // ─── inherit (the default) ───────────────────────────────────────────────

    @Component({
        imports: [RdxFloatingNodeRegistration],
        providers: [provideFloatingTree()],
        template: `
            <div #n rdxFloatingNode></div>
        `
    })
    class SingleHost {
        readonly n = viewChild.required('n', { read: RdxFloatingNodeRegistration });
    }

    it('registers a root node under the ambient tree (inherit, no DI parent)', () => {
        const fixture = TestBed.createComponent(SingleHost);
        fixture.detectChanges();

        const dir = fixture.componentInstance.n();
        const ambient = fixture.debugElement.injector.get(RDX_FLOATING_TREE);

        expect(dir.status()).toBe('registered');
        expect(dir.tree()).toBe(ambient);
        expect(dir.node()).not.toBeNull();
        expect(dir.node()!.parent).toBeNull();
        expect(ambient.all).toContain(dir.node());
    });

    @Component({
        imports: [RdxFloatingNodeRegistration],
        providers: [provideFloatingTree()],
        template: `
            <div #parent rdxFloatingNode>
                <div #child rdxFloatingNode></div>
            </div>
        `
    })
    class NestedHost {
        readonly parent = viewChild.required('parent', { read: RdxFloatingNodeRegistration });
        readonly child = viewChild.required('child', { read: RdxFloatingNodeRegistration });
    }

    it('nests a child under its DI parent in the same tree', () => {
        const fixture = TestBed.createComponent(NestedHost);
        fixture.detectChanges();

        const parent = fixture.componentInstance.parent();
        const child = fixture.componentInstance.child();

        expect(parent.tree()).toBe(child.tree());
        expect(child.node()!.parent).toBe(parent.node());
        expect(parent.tree()!.ancestors(child.node()!)).toEqual([parent.node()]);
    });

    // ─── overrides ───────────────────────────────────────────────────────────

    @Component({
        imports: [RdxFloatingNodeRegistration],
        providers: [provideFloatingTree()],
        template: `
            <div #parent rdxFloatingNode>
                <div #child [parentOverride]="override()" rdxFloatingNode></div>
            </div>
        `
    })
    class OverrideHost {
        readonly override = signal<RdxFloatingParentOverride>({ kind: 'inherit' });
        readonly parent = viewChild.required('parent', { read: RdxFloatingNodeRegistration });
        readonly child = viewChild.required('child', { read: RdxFloatingNodeRegistration });
    }

    it('{ kind: "root" } registers as an independent root despite the DI parent', () => {
        const fixture = TestBed.createComponent(OverrideHost);
        fixture.componentInstance.override.set({ kind: 'root' });
        fixture.detectChanges();

        const parent = fixture.componentInstance.parent();
        const child = fixture.componentInstance.child();

        // same tree (it inherited the ambient one), but NOT parented to the DI ancestor
        expect(child.tree()).toBe(parent.tree());
        expect(child.node()!.parent).toBeNull();
    });

    @Component({
        // deliberately NO provideFloatingTree → no ambient tree
        imports: [RdxFloatingNodeRegistration],
        template: `
            <div #n [parentOverride]="override()" rdxFloatingNode></div>
        `
    })
    class NodeOverrideHost {
        readonly override = signal<RdxFloatingParentOverride>({ kind: 'inherit' });
        readonly n = viewChild.required('n', { read: RdxFloatingNodeRegistration });
    }

    it('{ kind: "node", parent } joins the parent\'s tree even with no ambient tree', () => {
        const treeB = new RdxFloatingTree();
        const externalParent = treeB.register({ id: 'external-parent', parent: null, context: null });

        const fixture = TestBed.createComponent(NodeOverrideHost);
        fixture.componentInstance.override.set({ kind: 'node', parent: externalParent });
        fixture.detectChanges();

        const dir = fixture.componentInstance.n();
        expect(dir.tree()).toBe(treeB);
        expect(dir.node()!.parent).toBe(externalParent);
        expect(treeB.ancestors(dir.node()!)).toEqual([externalParent]);
    });

    // ─── node-optional ───────────────────────────────────────────────────────

    @Component({
        // no provideFloatingTree, no externalTree, inherit → no tree available
        imports: [RdxFloatingNodeRegistration],
        template: `
            <div #n rdxFloatingNode></div>
        `
    })
    class NoTreeHost {
        readonly n = viewChild.required('n', { read: RdxFloatingNodeRegistration });
    }

    it('runs node-optional (detached) when no tree is available', () => {
        const fixture = TestBed.createComponent(NoTreeHost);
        fixture.detectChanges();

        const dir = fixture.componentInstance.n();
        expect(dir.status()).toBe('detached');
        expect(dir.node()).toBeNull();
        expect(dir.tree()).toBeNull();
    });

    // ─── context attachment ──────────────────────────────────────────────────

    it('attaches the enclosing root context to its node', () => {
        const context = createFloatingRootContext({ ownerDocument: document, open: () => true });

        @Component({
            imports: [RdxFloatingNodeRegistration],
            providers: [provideFloatingTree(), provideFloatingRootContext(() => context)],
            template: `
                <div #n rdxFloatingNode></div>
            `
        })
        class ContextHost {
            readonly ctx: RdxFloatingRootContext = context;
            readonly n = viewChild.required('n', { read: RdxFloatingNodeRegistration });
        }

        const fixture = TestBed.createComponent(ContextHost);
        fixture.detectChanges();

        const dir = fixture.componentInstance.n();
        expect(dir.node()!.context).toBe(context);
        // the popup's open-state is read off the attached context (drives onlyOpen traversal)
        expect(dir.node()!.context!.open()).toBe(true);
    });

    // ─── teardown ──────────────────────────────────────────────────────────────

    it('unregisters the node when the directive is destroyed', () => {
        const fixture = TestBed.createComponent(SingleHost);
        fixture.detectChanges();

        const dir = fixture.componentInstance.n();
        const tree = dir.tree()!;
        const node = dir.node()!;
        expect(tree.all).toContain(node);

        fixture.destroy();

        // the unregistered node leaves the tree; no ghost stays in `all`
        expect(tree.all).not.toContain(node);
    });
});
