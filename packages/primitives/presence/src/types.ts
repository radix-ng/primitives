import { Subject } from 'rxjs';

type TransitionOptions<T> = {
    context?: T;
    animation: boolean;
    state?: 'continue' | 'stop';
    transitionTimerDelayMs?: number;
};

type TransitionContext<T> = {
    transition$: Subject<any>;
    complete: () => void;
    context: T;
};

type TransitionStartFn<T = any> = (element: HTMLElement, animation: boolean, context: T) => TransitionEndFn | void;

type TransitionEndFn = () => void;

export { TransitionContext, TransitionEndFn, TransitionOptions, TransitionStartFn };
