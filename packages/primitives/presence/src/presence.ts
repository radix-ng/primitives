import { NgZone } from '@angular/core';
import {
    EMPTY,
    endWith,
    filter,
    fromEvent,
    Observable,
    of,
    race,
    Subject,
    takeUntil,
    timer
} from 'rxjs';

import { TransitionContext, TransitionEndFn, TransitionOptions, TransitionStartFn } from './types';
import { getTransitionDurationMs, runInZone } from './utils';

const noopFn: TransitionEndFn = () => {
    /* Noop */
};
const TransitionsMap = new Map<HTMLElement, TransitionContext<any>>();

/**
 * Manages the presence of an element with optional transition animation.
 *
 * @template T - The type of the context object used in the transition.
 * @param {NgZone} zone - The Angular zone to control the change detection context.
 * @param {HTMLElement} element - The target HTML element to apply the transition.
 * @param {TransitionOptions<T>} options - Options for controlling the transition behavior.
 *   @param {T} [options.context] - An optional context object to pass through the transition.
 *   @param {boolean} options.animation - A flag indicating if the transition should be animated.
 *   @param {'start' | 'continue' | 'stop'} options.state - The desired state of the transition.
 * @param {TransitionStartFn<T>} startFn - A function to start the transition.
 * @returns {Observable<void>} - An observable that emits when the transition completes.
 *
 * The `usePresence` function is designed to manage the presence and visibility of an HTML element,
 * optionally applying a transition animation. It utilizes Angular's NgZone for efficient change
 * detection management and allows for different states of transitions ('start', 'continue', 'stop').
 * The function takes a start function to handle the beginning of the transition and returns an
 * observable that completes when the transition ends.
 *
 * Example usage:
 *
 * const options: TransitionOptions<MyContext> = {
 *   context: {}, // your context object
 *   animation: true,
 *   state: 'start'
 * };
 *
 * const startFn: TransitionStartFn<MyContext> = (el, animation, context) => {
 *   el.classList.add('active');
 *   return () => el.classList.remove('active');
 * };
 *
 * usePresence(zone, element, startFn, options).subscribe(() => {
 *   console.log('Transition completed');
 * });
 */
const usePresence = <T>(
    zone: NgZone,
    element: HTMLElement,
    startFn: TransitionStartFn<T>,
    options: TransitionOptions<T>
): Observable<void> => {
    let context = options.context || <T>{};

    const transitionTimerDelayMs = options.transitionTimerDelayMs ?? 5;
    const state = options.state ?? 'stop';

    const running = TransitionsMap.get(element);

    if (running) {
        switch (state) {
            case 'continue':
                return EMPTY;
            case 'stop':
                zone.run(() => running.transition$.complete());
                context = { ...running.context, ...context };
                TransitionsMap.delete(element);
                break;
        }
    }
    const endFn = startFn(element, options.animation, context) || noopFn;

    if (!options.animation || window.getComputedStyle(element).transitionProperty === 'none') {
        zone.run(() => endFn());
        return of(undefined).pipe(runInZone(zone));
    }

    const transition$ = new Subject<void>();
    const finishTransition$ = new Subject<void>();
    const stop$ = transition$.pipe(endWith(true));

    TransitionsMap.set(element, {
        transition$,
        complete: () => {
            finishTransition$.next();
            finishTransition$.complete();
        },
        context
    });

    const transitionDurationMs = getTransitionDurationMs(element);

    zone.runOutsideAngular(() => {
        const transitionEnd$ = fromEvent<TransitionEvent>(element, 'transitionend').pipe(
            takeUntil(stop$),
            filter(({ target }) => target === element)
        );
        const timer$ = timer(transitionDurationMs + transitionTimerDelayMs).pipe(takeUntil(stop$));

        race(timer$, transitionEnd$, finishTransition$)
            .pipe(takeUntil(stop$))
            .subscribe(() => {
                TransitionsMap.delete(element);
                zone.run(() => {
                    endFn();
                    transition$.next();
                    transition$.complete();
                });
            });
    });

    return transition$.asObservable();
};

const completeTransition = (element: HTMLElement) => {
    TransitionsMap.get(element)?.complete();
};

export { usePresence, completeTransition };
