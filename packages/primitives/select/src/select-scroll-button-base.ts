import { DestroyRef, Directive, effect, inject, output, signal } from '@angular/core';
import { injectSelectPopupContext } from './select-popup';

@Directive({
    selector: '[rdxSelectScrollButtonBase]',
    host: {
        '[attr.aria-hidden]': 'true',
        '(pointerdown)': 'handlePointerDown()',
        '(pointermove)': 'handlePointerMove()',
        '(pointerleave)': 'clearAutoScrollTimer()',
        '[style]': `{
            flexShrink: 0
        }`
    }
})
export class RdxSelectScrollButtonBase {
    private readonly contentContext = injectSelectPopupContext();

    readonly autoScrollTimerRef = signal<number | null>(null);

    readonly autoScroll = output();

    constructor() {
        effect(() => {
            this.contentContext.highlightedItem()?.element.scrollIntoView({ block: 'nearest' });
        });

        inject(DestroyRef).onDestroy(() => {
            this.clearAutoScrollTimer();
        });
    }

    clearAutoScrollTimer() {
        if (this.autoScrollTimerRef() !== null) {
            window.clearInterval(this.autoScrollTimerRef()!);
            this.autoScrollTimerRef.set(null);
        }
    }

    handlePointerDown() {
        if (this.autoScrollTimerRef() === null) {
            this.autoScrollTimerRef.set(
                window.setInterval(() => {
                    this.autoScroll.emit();
                }, 50)
            );
        }
    }

    handlePointerMove() {
        this.contentContext.onItemLeave?.();
        if (this.autoScrollTimerRef() === null) {
            this.autoScrollTimerRef.set(
                window.setInterval(() => {
                    this.autoScroll.emit();
                }, 50)
            );
        }
    }
}
