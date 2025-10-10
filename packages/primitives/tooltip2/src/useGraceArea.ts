import { effect, signal, type Signal, type WritableSignal } from '@angular/core';
import { Side } from '@radix-ng/primitives/popper';

function createSignalEvent<T = void>() {
    const handlers = new Set<(v: T) => void>();
    return {
        on(cb: (v: T) => void): () => void {
            handlers.add(cb);
            return () => handlers.delete(cb);
        },
        emit(v: T extends void ? never : T extends undefined ? never : T): void {
            handlers.forEach((h) => h(v));
        },
        emitVoid(): void {
            handlers.forEach((h) => h(undefined as unknown as T));
        },
        clear() {
            handlers.clear();
        }
    };
}

/**
 *
 * @param triggerEl   Signal<HTMLElement | null | undefined>
 * @param containerEl Signal<HTMLElement | null | undefined>
 * @param resetMs
 */
export function useGraceArea(
    triggerEl: Signal<HTMLElement | null | undefined>,
    containerEl: Signal<HTMLElement | null | undefined>,
    resetMs = 300
) {
    const isPointerInTransit: WritableSignal<boolean> = signal(false);
    const pointerExit = createSignalEvent<void>();

    let pointerGraceArea: Polygon | null = null;
    let resetTimer: number | null = null;

    function armInTransitAutoReset() {
        if (resetTimer !== null) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
            isPointerInTransit.set(false);
            resetTimer = null;
        }, resetMs);
    }

    function clearGraceArea() {
        pointerGraceArea = null;
        isPointerInTransit.set(false);
        if (resetTimer !== null) {
            window.clearTimeout(resetTimer);
            resetTimer = null;
        }
    }

    function createGraceArea(event: PointerEvent, hoverTarget: HTMLElement) {
        const currentTarget = event.currentTarget as HTMLElement;
        const exitPoint = { x: event.clientX, y: event.clientY };
        const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
        const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
        const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
        pointerGraceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
        isPointerInTransit.set(true);
        armInTransitAutoReset();
    }

    function trackPointerGrace(event: PointerEvent) {
        if (!pointerGraceArea) return;
        if (!(event.target instanceof HTMLElement)) return;

        const trigger = triggerEl();
        const container = containerEl();
        if (!trigger || !container) return;

        const target = event.target;
        const pointerPosition = { x: event.clientX, y: event.clientY };
        const hasEnteredTarget = trigger.contains(target) || container.contains(target);
        const isOutsideGrace = !isPointInPolygon(pointerPosition, pointerGraceArea);
        const isAnotherGraceAreaTrigger = !!target.closest('[data-grace-area-trigger]');

        if (hasEnteredTarget) {
            clearGraceArea();
        } else if (isOutsideGrace || isAnotherGraceAreaTrigger) {
            clearGraceArea();
            pointerExit.emitVoid();
        }
    }

    // Подписываемся и пересоздаём слушатели, когда меняются элементы
    effect((onCleanupFn) => {
        const trigger = triggerEl();
        const container = containerEl();

        onCleanupFn(() => {
            const doc = trigger?.ownerDocument;
            trigger?.removeEventListener('pointerleave', onTriggerLeave as EventListener);
            container?.removeEventListener('pointerleave', onContainerLeave as EventListener);
            doc?.removeEventListener('pointermove', trackPointerGrace as EventListener);
            trigger?.removeAttribute('data-grace-area-trigger');
            clearGraceArea();
        });

        if (!trigger || !container) return;

        trigger.setAttribute('data-grace-area-trigger', '');

        const onTriggerLeave = (e: PointerEvent) => createGraceArea(e, container);
        const onContainerLeave = (e: PointerEvent) => createGraceArea(e, trigger);

        trigger.addEventListener('pointerleave', onTriggerLeave as EventListener, { passive: true });
        container.addEventListener('pointerleave', onContainerLeave as EventListener, { passive: true });
        trigger.ownerDocument.addEventListener('pointermove', trackPointerGrace as EventListener, { passive: true });
    });

    return {
        /** readonly-сигнал для UI */
        isPointerInTransit: isPointerInTransit.asReadonly(),
        /** подписка на выход указателя из grace-area */
        onPointerExit: pointerExit.on
    };
}

interface Point {
    x: number;
    y: number;
}
type Polygon = Point[];

function getExitSideFromRect(point: Point, rect: DOMRect): Side {
    const top = Math.abs(rect.top - point.y);
    const bottom = Math.abs(rect.bottom - point.y);
    const right = Math.abs(rect.right - point.x);
    const left = Math.abs(rect.left - point.x);

    switch (Math.min(top, bottom, right, left)) {
        case left:
            return 'left';
        case right:
            return 'right';
        case top:
            return 'top';
        case bottom:
            return 'bottom';
        default:
            throw new Error('unreachable');
    }
}

function getPaddedExitPoints(exitPoint: Point, exitSide: Side, padding = 5) {
    const pts: Point[] = [];
    switch (exitSide) {
        case 'top':
            pts.push(
                { x: exitPoint.x - padding, y: exitPoint.y + padding },
                { x: exitPoint.x + padding, y: exitPoint.y + padding }
            );
            break;
        case 'bottom':
            pts.push(
                { x: exitPoint.x - padding, y: exitPoint.y - padding },
                { x: exitPoint.x + padding, y: exitPoint.y - padding }
            );
            break;
        case 'left':
            pts.push(
                { x: exitPoint.x + padding, y: exitPoint.y - padding },
                { x: exitPoint.x + padding, y: exitPoint.y + padding }
            );
            break;
        case 'right':
            pts.push(
                { x: exitPoint.x - padding, y: exitPoint.y - padding },
                { x: exitPoint.x - padding, y: exitPoint.y + padding }
            );
            break;
    }
    return pts;
}

function getPointsFromRect(rect: DOMRect) {
    const { top, right, bottom, left } = rect;
    return [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom }
    ];
}

function isPointInPolygon(point: Point, polygon: Polygon) {
    const { x, y } = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x,
            yi = polygon[i].y;
        const xj = polygon[j].x,
            yj = polygon[j].y;
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

function getHull<P extends Point>(points: Readonly<Array<P>>): Array<P> {
    const newPoints: Array<P> = points.slice() as Array<P>;
    newPoints.sort((a, b) => a.x - b.x || a.y - b.y);
    return getHullPresorted(newPoints);
}

function getHullPresorted<P extends Point>(points: Readonly<Array<P>>): Array<P> {
    if (points.length <= 1) return points.slice() as Array<P>;

    const upper: Array<P> = [];
    for (let i = 0; i < points.length; i++) {
        const p = points[i]!;
        while (upper.length >= 2) {
            const q = upper[upper.length - 1]!;
            const r = upper[upper.length - 2]!;
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upper.pop();
            else break;
        }
        upper.push(p);
    }
    upper.pop();

    const lower: Array<P> = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i]!;
        while (lower.length >= 2) {
            const q = lower[lower.length - 1]!;
            const r = lower[lower.length - 2]!;
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lower.pop();
            else break;
        }
        lower.push(p);
    }
    lower.pop();

    if (upper.length === 1 && lower.length === 1 && upper[0]!.x === lower[0]!.x && upper[0]!.y === lower[0]!.y) {
        return upper;
    } else {
        return upper.concat(lower);
    }
}
