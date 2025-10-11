import { afterNextRender, Directive, effect, inject, Injector } from '@angular/core';

/** Number of components which have requested interest to have focus guards */
let count = 0;

/**
 * Injects a pair of focus guards at the edges of the whole DOM tree
 * to ensure `focusin` & `focusout` events can be caught consistently.
 */
@Directive({
    selector: '[rdxFocusGuards]'
})
export class RdxFocusGuards {
    private readonly injector = inject(Injector);

    constructor() {
        afterNextRender(() => {
            effect(
                (onCleanup) => {
                    const edgeGuards = document.querySelectorAll('[data-radix-focus-guard]');

                    document.body.insertAdjacentElement('afterbegin', edgeGuards[0] ?? this.createFocusGuard());

                    document.body.insertAdjacentElement('beforeend', edgeGuards[1] ?? this.createFocusGuard());

                    count++;

                    onCleanup(() => {
                        if (count === 1) {
                            document.querySelectorAll('[data-radix-focus-guard]').forEach((node) => node.remove());
                        }

                        count--;
                    });
                },
                { injector: this.injector }
            );
        });
    }

    createFocusGuard() {
        const element = document.createElement('span');
        element.setAttribute('data-radix-focus-guard', '');
        element.tabIndex = 0;
        element.style.outline = 'none';
        element.style.opacity = '0';
        element.style.position = 'fixed';
        element.style.pointerEvents = 'none';
        return element;
    }
}
