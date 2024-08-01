import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Ensures that the observable stream runs inside Angular's NgZone.
 *
 * This function is a higher-order function that takes an observable stream as input and ensures
 * that all emissions, errors, and completion notifications are run inside Angular's NgZone. This
 * is particularly useful for ensuring that change detection is triggered properly in Angular
 * applications.
 *
 * @template T - The type of the items emitted by the observable.
 * @param {NgZone} zone - The Angular zone to control the change detection context.
 * @returns {(source: Observable<T>) => Observable<T>} - A function that takes an observable as input
 * and returns an observable that runs inside Angular's NgZone.
 *
 * Example usage:
 *
 * const source$ = of('some value');
 * const zoned$ = source$.pipe(runInZone(zone));
 * zoned$.subscribe(value => {
 *   console.log('Value:', value);
 * });
 */
function runInZone<T>(zone: NgZone): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) =>
        new Observable((observer) =>
            source.subscribe({
                next: (value) => zone.run(() => observer.next(value)),
                error: (err) => zone.run(() => observer.error(err)),
                complete: () => zone.run(() => observer.complete())
            })
        );
}

/**
 * Calculates the total transition duration in milliseconds for a given HTML element.
 *
 * This function retrieves the computed style of the specified element and extracts the
 * transition duration and delay properties. It then converts these values from seconds
 * to milliseconds and returns their sum, representing the total transition duration.
 *
 * @param {HTMLElement} element - The HTML element for which to calculate the transition duration.
 * @returns {number} - The total transition duration in milliseconds.
 *
 * Example usage:
 *
 * const durationMs = getTransitionDurationMs(element);
 * console.log(`Transition duration: ${durationMs} ms`);
 */
function getTransitionDurationMs(element: HTMLElement): number {
    const { transitionDelay, transitionDuration } = window.getComputedStyle(element);
    const transitionDelaySec = parseFloat(transitionDelay);
    const transitionDurationSec = parseFloat(transitionDuration);

    return (transitionDelaySec + transitionDurationSec) * 1000;
}

export { getTransitionDurationMs, runInZone };

export function triggerReflow(element: HTMLElement) {
    return (element || document.body).getBoundingClientRect();
}
