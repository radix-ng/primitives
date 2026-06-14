import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RdxDismissableLayer } from '../src/dismissable-layer';
import { RdxDismissableLayerBranch } from '../src/dismissable-layer-branch';
import { RdxDismissableLayersContextToken } from '../src/dismissable-layer.config';

/**
 * Characterization baseline for the behaviors that ADR 0015 Phase 1 rewrites through the shared
 * tree/capability — they must pass against the CURRENT (pre-refactor) implementation so the refactor is
 * proven behavior-preserving. (Portaled-child / non-modal-child cases are the known-bug targets and are
 * authored together with the Phase 2 fix, not here.)
 */
@Component({
    imports: [RdxDismissableLayer, RdxDismissableLayerBranch],
    template: `
        <div (dismiss)="onDismiss()" rdxDismissableLayer>Layer</div>
        <div #branch rdxDismissableLayerBranch>Branch</div>
        <button #trigger type="button">Trigger</button>
        <div #outside>Outside</div>

        @if (showNested()) {
            <div (dismiss)="onDismissParent()" rdxDismissableLayer>Parent</div>
            <!-- child is a DOM SIBLING, so a pointer inside it IS outside the parent — the parent is
                 protected only by the modal pointer-events layering, not by DOM containment -->
            <div [disableOutsidePointerEvents]="childModal()" (dismiss)="onDismissChild()" rdxDismissableLayer>
                Child
                <span id="inside-child">inside child</span>
            </div>
        }
    `
})
class Host {
    readonly onDismiss = vi.fn();
    readonly onDismissParent = vi.fn();
    readonly onDismissChild = vi.fn();
    readonly showNested = signal(false);
    readonly childModal = signal(true);
}

/** The document `pointerdown` listener registers on a `setTimeout(0)`; drain a macrotask first. */
function flushListenerRegistration(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve));
}

function pointerDownOn(element: Element): void {
    element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
}

/** Focus-outside defers two microtasks before deciding; drain them after dispatching `focusin`. */
async function focusInOn(element: Element): Promise<void> {
    element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
}

describe('RdxDismissableLayer — characterization baseline', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    function query(selector: string): HTMLElement {
        return fixture.nativeElement.querySelector(selector) as HTMLElement;
    }

    beforeEach(async () => {
        document.body.style.pointerEvents = '';
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        fixture.detectChanges();
        await flushListenerRegistration();
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.pointerEvents = '';
    });

    it('control: a pointerdown on an unrelated outside element DOES dismiss', () => {
        pointerDownOn(query('div:last-of-type'));
        expect(host.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('a pointerdown on a registered branch does NOT dismiss', () => {
        pointerDownOn(query('[rdxDismissableLayerBranch]'));
        expect(host.onDismiss).not.toHaveBeenCalled();
    });

    it('a focus moving into a registered branch does NOT dismiss', async () => {
        await focusInOn(query('[rdxDismissableLayerBranch]'));
        expect(host.onDismiss).not.toHaveBeenCalled();
    });

    it('a pointerdown on an associated trigger (registered as a branch) does NOT dismiss', async () => {
        // Menu / Navigation Menu register their trigger as an inside-element via the branch array today.
        const trigger = query('button');
        const context = TestBed.inject(RdxDismissableLayersContextToken);
        context.branches.update((branches) => [...branches, trigger]);

        pointerDownOn(trigger);

        expect(host.onDismiss).not.toHaveBeenCalled();
    });

    it('a pointerdown inside a sibling MODAL layer does NOT dismiss the layer below it (pointer-events suppression)', async () => {
        host.childModal.set(true);
        host.showNested.set(true);
        fixture.detectChanges();
        await flushListenerRegistration();

        // the span is in the sibling child — genuinely OUTSIDE the parent's DOM — so only the modal
        // pointer-events layering protects the parent
        pointerDownOn(query('#inside-child'));

        expect(host.onDismissParent).not.toHaveBeenCalled();
    });

    it('control: a pointerdown inside a sibling NON-MODAL layer DOES dismiss the layer below it', async () => {
        host.childModal.set(false);
        host.showNested.set(true);
        fixture.detectChanges();
        await flushListenerRegistration();

        // proves the harness really delivers an outside-pointer to the parent from the sibling — so the
        // modal test above is meaningful (it is the suppression, not DOM containment, that protects)
        pointerDownOn(query('#inside-child'));

        expect(host.onDismissParent).toHaveBeenCalledTimes(1);
    });
});
