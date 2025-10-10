import { Directive, ElementRef, inject, input, signal } from '@angular/core';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectRdxTooltipContext } from './tooltip';

@Directive({
    selector: '[rdxTooltipTriggerV2]',
    hostDirectives: [RdxPopperAnchor],
    host: {
        'data-grace-area-trigger': "''",
        '[attr.aria-describedby]': 'rootContext.isOpen() ? rootContext.contentId : undefined',
        '[attr.data-state]': 'rootContext.state()',
        '(pointermove)': 'pointerMoved($event)',
        '(pointerleave)': 'handlePointerLeave()',
        '(pointerdown)': 'handlePointerDown($event)',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',
        '(click)': 'handleClick()'
    }
})
export class RdxTooltipTrigger {
    protected readonly rootContext = injectRdxTooltipContext()!;
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly userOnPointerDown = input<(event: PointerEvent) => void | boolean | Promise<void | boolean> | undefined>(
        undefined,
        {
            alias: 'rdxOnPointerDown'
        }
    );

    protected readonly isPointerDown = signal(false);

    private readonly hasPointerMoveOpened = signal(false);

    protected handleFocus() {
        if (this.rootContext.controlledState()) return;
        if (this.isPointerDown()) return;

        this.rootContext.open();
    }

    protected handleBlur() {
        if (this.rootContext.controlledState()) return;
        this.rootContext.close();
    }

    protected handleClick() {
        if (this.rootContext.controlledState()) return;
        if (!this.rootContext.disableClosingTrigger()) {
            this.rootContext.close();
        }
    }

    protected pointerMoved(event: PointerEvent) {
        if (event.pointerType === 'touch') return;
        if (this.rootContext.controlledState()) return;
        if (!this.hasPointerMoveOpened() && !this.rootContext.isPointerInTransit()) {
            this.rootContext.onTriggerEnter();
            this.hasPointerMoveOpened.set(true);
        }
    }

    protected handlePointerLeave() {
        if (this.rootContext.controlledState()) return;
        this.rootContext.onTriggerLeave();
        this.hasPointerMoveOpened.set(false);
    }

    protected async handlePointerDown(event: PointerEvent) {
        const user = this.userOnPointerDown();
        let result: unknown;

        if (user) {
            result = user(event);
            if (result instanceof Promise) result = await result;
        }

        if (event.defaultPrevented || result === false) return;

        if (this.rootContext.isOpen() && !this.rootContext.disableClosingTrigger()) {
            this.rootContext.close();
        }

        this.isPointerDown.set(true);

        const handlePointerUp = () => {
            setTimeout(() => this.isPointerDown.set(false), 1);
        };

        document.addEventListener('pointerup', handlePointerUp, { once: true });
    }
}
