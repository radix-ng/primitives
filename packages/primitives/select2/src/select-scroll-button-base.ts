import { DestroyRef, Directive, effect, inject, output, signal } from '@angular/core';
import { useCollection } from '@radix-ng/primitives/collection';
import { getActiveElement } from '@radix-ng/primitives/core';
import { injectSelectContentContext } from './select-content';

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
    private readonly contentContext = injectSelectContentContext()!;

    readonly autoScrollTimerRef = signal<number | null>(null);

    readonly autoScroll = output();

    readonly getItems: ReturnType<typeof useCollection>['getItems'];

    constructor() {
        const { getItems } = useCollection();
        this.getItems = getItems;

        effect(() => {
            const activeItem = getItems()
                .map((i) => i.ref)
                .find((item) => item === getActiveElement());
            activeItem?.scrollIntoView({ block: 'nearest' });
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
