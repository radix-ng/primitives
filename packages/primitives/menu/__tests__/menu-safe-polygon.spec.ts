import {
    applyPointerTunnel,
    hasOpenChildSubmenu,
    isPointInQuadrilateral,
    registerOpenSubmenu
} from '../src/menu-safe-polygon';

// ─── Geometry ─────────────────────────────────────────────────────────────────

describe('isPointInQuadrilateral', () => {
    // Axis-aligned square (0,0)-(10,10), vertices given clockwise.
    const square = [0, 0, 10, 0, 10, 10, 0, 10] as const;

    it('returns true for a point well inside', () => {
        expect(isPointInQuadrilateral(5, 5, ...square)).toBe(true);
    });

    it('returns false for a point outside', () => {
        expect(isPointInQuadrilateral(20, 5, ...square)).toBe(false);
        expect(isPointInQuadrilateral(5, -5, ...square)).toBe(false);
    });

    it('models a submenu-to-the-right safe triangle (apex at cursor, base on popup edge)', () => {
        // Apex (cursor leaving the trigger) at (0, 50); popup near edge x=100 from y=0..100.
        const apexX = 0;
        const apexY = 50;
        const edgeX = 100;
        // Degenerate quad = triangle: apex, apex, top-corner, bottom-corner.
        const tri = [apexX, apexY, apexX, apexY, edgeX, 0, edgeX, 100] as const;

        // A diagonal point heading toward the popup stays inside the wedge.
        expect(isPointInQuadrilateral(50, 40, ...tri)).toBe(true);
        expect(isPointInQuadrilateral(50, 60, ...tri)).toBe(true);
        // A point far above the wedge (sharp upward move off-path) is outside.
        expect(isPointInQuadrilateral(50, -40, ...tri)).toBe(false);
    });
});

// ─── Pointer-events tunnel ────────────────────────────────────────────────────

describe('applyPointerTunnel', () => {
    let scope: HTMLElement;
    let reference: HTMLElement;
    let floating: HTMLElement;

    beforeEach(() => {
        scope = document.createElement('div');
        reference = document.createElement('button');
        floating = document.createElement('div');
        document.body.append(scope, reference, floating);
    });

    afterEach(() => {
        scope.remove();
        reference.remove();
        floating.remove();
    });

    it('disables pointer events on the scope and keeps reference + floating interactive', () => {
        const restore = applyPointerTunnel(scope, reference, floating);
        expect(scope.style.pointerEvents).toBe('none');
        expect(reference.style.pointerEvents).toBe('auto');
        expect(floating.style.pointerEvents).toBe('auto');
        restore();
    });

    it('restores the exact previous inline values on cleanup', () => {
        scope.style.pointerEvents = 'all';
        reference.style.pointerEvents = '';
        const restore = applyPointerTunnel(scope, reference, floating);
        restore();
        expect(scope.style.pointerEvents).toBe('all');
        expect(reference.style.pointerEvents).toBe('');
        expect(floating.style.pointerEvents).toBe('');
    });

    it('is idempotent — calling cleanup twice does not re-restore', () => {
        const restore = applyPointerTunnel(scope, reference, floating);
        restore();
        scope.style.pointerEvents = 'changed-after';
        restore();
        expect(scope.style.pointerEvents).toBe('changed-after');
    });
});

// ─── Open-submenu registry / hasOpenChild ─────────────────────────────────────

describe('open-submenu registry', () => {
    it('reports a descendant submenu as an open child', () => {
        const parentPopup = document.createElement('div');
        const parentTrigger = document.createElement('button');
        const childTrigger = document.createElement('button'); // nested inside the parent popup
        parentPopup.appendChild(childTrigger);
        const childPopup = document.createElement('div');
        document.body.append(parentPopup, parentTrigger, childPopup);

        const unregisterParent = registerOpenSubmenu(parentTrigger, parentPopup);
        const unregisterChild = registerOpenSubmenu(childTrigger, childPopup);

        // The parent must not close while its descendant submenu is open.
        expect(hasOpenChildSubmenu(parentTrigger, parentPopup)).toBe(true);
        // The child has no open descendants of its own.
        expect(hasOpenChildSubmenu(childTrigger, childPopup)).toBe(false);

        unregisterChild();
        expect(hasOpenChildSubmenu(parentTrigger, parentPopup)).toBe(false);

        unregisterParent();
        parentPopup.remove();
        parentTrigger.remove();
        childPopup.remove();
    });

    it('cleanup only removes its own entry', () => {
        const trigger = document.createElement('button');
        const popupA = document.createElement('div');
        const popupB = document.createElement('div');

        const unregisterA = registerOpenSubmenu(trigger, popupA);
        const unregisterB = registerOpenSubmenu(trigger, popupB); // re-registered with a new popup
        unregisterA(); // stale cleanup — must not delete the B entry

        const sibling = document.createElement('div');
        sibling.appendChild(trigger);
        expect(hasOpenChildSubmenu(document.createElement('div'), sibling)).toBe(true);

        unregisterB();
    });
});
