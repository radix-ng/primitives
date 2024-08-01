import { TransitionStartFn } from '../types';
import { triggerReflow } from '../utils';

export const toastFadeInTransition: TransitionStartFn = (element: HTMLElement, animation: boolean) => {
    const { classList } = element;

    if (animation) {
        classList.add('fade');
    } else {
        classList.add('show');
        return;
    }

    triggerReflow(element);
    classList.add('show', 'showing');

    return () => {
        classList.remove('showing');
    };
};

export const toastFadeOutTransition: TransitionStartFn = ({ classList }: HTMLElement) => {
    classList.add('showing');
    return () => {
        classList.remove('show', 'showing');
    };
};
