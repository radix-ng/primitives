import { AfterViewInit, Directive } from '@angular/core';

const callAll =
    <T extends (...a: never[]) => void>(...fns: (T | undefined)[]) =>
    (...a: Parameters<T>) => {
        fns.forEach(function (fn) {
            fn?.(...a);
        });
    };

@Directive({
    standalone: true
})
export class OnMountDirective implements AfterViewInit {
    #onMountFns?: () => void;

    onMount(fn: () => void) {
        this.#onMountFns = callAll(this.#onMountFns, fn);
    }

    ngAfterViewInit() {
        if (!this.#onMountFns) {
            throw new Error('The onMount function must be called before the component is mounted.');
        }
        this.#onMountFns();
    }
}
