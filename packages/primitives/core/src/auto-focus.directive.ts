import { booleanAttribute, Directive, ElementRef, inject, Input, NgZone } from '@angular/core';

/*
 * <div [rdxAutoFocus]="true"></div>
 */

@Directive({
    selector: '[rdxAutoFocus]',
    standalone: true
})
export class RdxAutoFocusDirective {
    #elementRef = inject(ElementRef);
    #ngZone = inject(NgZone);

    private _autoSelect = false;

    /**
     * @default false
     */
    @Input({ alias: 'rdxAutoFocus', transform: booleanAttribute })
    set autoFocus(value: boolean) {
        if (value) {
            // Note: Running this outside Angular's zone because `element.focus()` does not trigger change detection.
            this.#ngZone.runOutsideAngular(() =>
                // Note: `element.focus()` causes re-layout which might lead to frame drops on slower devices.
                // https://gist.github.com/paulirish/5d52fb081b3570c81e3a#setting-focus
                // `setTimeout` is a macrotask executed within the current rendering frame.
                // Animation tasks are executed in the next rendering frame.
                reqAnimationFrame(() => {
                    this.#elementRef.nativeElement.focus();
                    if (this._autoSelect && this.#elementRef.nativeElement.select) {
                        this.#elementRef.nativeElement.select();
                    }
                })
            );
        }
    }

    // Setter for autoSelect attribute to enable text selection when autoFocus is true.
    @Input({ transform: booleanAttribute })
    set autoSelect(value: boolean) {
        this._autoSelect = value;
    }
}

const availablePrefixes = ['moz', 'ms', 'webkit'];

function requestAnimationFramePolyfill(): typeof requestAnimationFrame {
    let lastTime = 0;

    return function (callback: FrameRequestCallback): number {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));

        const id = setTimeout(() => {
            callback(currTime + timeToCall);
        }, timeToCall) as any;

        lastTime = currTime + timeToCall;

        return id;
    };
}

// Function to get the appropriate requestAnimationFrame method with fallback to polyfill.
function getRequestAnimationFrame(): typeof requestAnimationFrame {
    if (typeof window === 'undefined') {
        return () => 0;
    }
    if (window.requestAnimationFrame) {
        // https://github.com/vuejs/vue/issues/4465
        return window.requestAnimationFrame.bind(window);
    }

    const prefix = availablePrefixes.filter((key) => `${key}RequestAnimationFrame` in window)[0];

    return prefix
        ? (window as any)[`${prefix}RequestAnimationFrame`]
        : requestAnimationFramePolyfill();
}

// Get the requestAnimationFrame function or its polyfill.
const reqAnimationFrame = getRequestAnimationFrame();
