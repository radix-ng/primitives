import { effect, type Signal, signal, type WritableSignal } from '@angular/core';

type Side = 'top' | 'right' | 'bottom' | 'left';

const graceAreaContainers = new WeakMap<HTMLElement, HTMLElement>();

function createSignalEvent<T = void>() {
    const handlers = new Set<(value: T) => void>();

    return {
        on(callback: (value: T) => void): () => void {
            handlers.add(callback);
            return () => handlers.delete(callback);
        },
        emitVoid(): void {
            handlers.forEach((handler) => handler(undefined as unknown as T));
        }
    };
}

/**
 * Keeps hover content open while the pointer crosses the gap between a trigger and a popup.
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
        if (!pointerGraceArea || !(event.target instanceof HTMLElement)) return;

        const trigger = triggerEl();
        const container = containerEl();
        if (!trigger || !container) return;

        const target = event.target;
        const pointerPosition = { x: event.clientX, y: event.clientY };
        const enteredContainer = target.closest<HTMLElement>('[data-grace-area-container]');
        const nestedTrigger = enteredContainer ? graceAreaContainers.get(enteredContainer) : undefined;
        const hasEnteredTarget =
            trigger.contains(target) ||
            container.contains(target) ||
            (nestedTrigger ? container.contains(nestedTrigger) : false);
        const isOutsideGrace = !isPointInPolygon(pointerPosition, pointerGraceArea);
        const isAnotherGraceAreaTrigger = !!target.closest('[data-grace-area-trigger]');

        if (hasEnteredTarget) {
            clearGraceArea();
        } else if (isOutsideGrace || isAnotherGraceAreaTrigger) {
            clearGraceArea();
            pointerExit.emitVoid();
        }
    }

    effect((onCleanup) => {
        const trigger = triggerEl();
        const container = containerEl();
        const onTriggerLeave = (event: PointerEvent) => {
            if (container) createGraceArea(event, container);
        };
        const onContainerLeave = (event: PointerEvent) => {
            if (trigger) createGraceArea(event, trigger);
        };

        onCleanup(() => {
            const doc = trigger?.ownerDocument;
            trigger?.removeEventListener('pointerleave', onTriggerLeave as EventListener);
            container?.removeEventListener('pointerleave', onContainerLeave as EventListener);
            doc?.removeEventListener('pointermove', trackPointerGrace as EventListener);
            trigger?.removeAttribute('data-grace-area-trigger');
            container?.removeAttribute('data-grace-area-container');

            if (container && graceAreaContainers.get(container) === trigger) {
                graceAreaContainers.delete(container);
            }

            clearGraceArea();
        });

        if (!trigger || !container) return;

        trigger.setAttribute('data-grace-area-trigger', '');
        container.setAttribute('data-grace-area-container', '');
        graceAreaContainers.set(container, trigger);

        trigger.addEventListener('pointerleave', onTriggerLeave as EventListener, { passive: true });
        container.addEventListener('pointerleave', onContainerLeave as EventListener, { passive: true });
        trigger.ownerDocument.addEventListener('pointermove', trackPointerGrace as EventListener, { passive: true });
    });

    return {
        isPointerInTransit: isPointerInTransit.asReadonly(),
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
    const min = Math.min(top, bottom, right, left);

    if (!Number.isFinite(min)) {
        return 'bottom';
    }

    switch (min) {
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
    const points: Point[] = [];

    switch (exitSide) {
        case 'top':
            points.push(
                { x: exitPoint.x - padding, y: exitPoint.y + padding },
                { x: exitPoint.x + padding, y: exitPoint.y + padding }
            );
            break;
        case 'bottom':
            points.push(
                { x: exitPoint.x - padding, y: exitPoint.y - padding },
                { x: exitPoint.x + padding, y: exitPoint.y - padding }
            );
            break;
        case 'left':
            points.push(
                { x: exitPoint.x + padding, y: exitPoint.y - padding },
                { x: exitPoint.x + padding, y: exitPoint.y + padding }
            );
            break;
        case 'right':
            points.push(
                { x: exitPoint.x - padding, y: exitPoint.y - padding },
                { x: exitPoint.x - padding, y: exitPoint.y + padding }
            );
            break;
    }

    return points;
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
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }

    return inside;
}

function getHull<PointType extends Point>(points: Readonly<Array<PointType>>): Array<PointType> {
    const sortedPoints: Array<PointType> = points.slice();
    sortedPoints.sort((a, b) => a.x - b.x || a.y - b.y);
    return getHullPresorted(sortedPoints);
}

function getHullPresorted<PointType extends Point>(points: Readonly<Array<PointType>>): Array<PointType> {
    if (points.length <= 1) return points.slice();

    const upper: Array<PointType> = [];
    for (const point of points) {
        while (upper.length >= 2) {
            const q = upper[upper.length - 1];
            const r = upper[upper.length - 2];
            if ((q.x - r.x) * (point.y - r.y) >= (q.y - r.y) * (point.x - r.x)) upper.pop();
            else break;
        }
        upper.push(point);
    }
    upper.pop();

    const lower: Array<PointType> = [];
    for (let index = points.length - 1; index >= 0; index--) {
        const point = points[index];
        while (lower.length >= 2) {
            const q = lower[lower.length - 1];
            const r = lower[lower.length - 2];
            if ((q.x - r.x) * (point.y - r.y) >= (q.y - r.y) * (point.x - r.x)) lower.pop();
            else break;
        }
        lower.push(point);
    }
    lower.pop();

    if (upper.length === 1 && lower.length === 1 && upper[0].x === lower[0].x && upper[0].y === lower[0].y) {
        return upper;
    }

    return upper.concat(lower);
}
