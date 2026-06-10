import { computed, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import * as kbd from '@radix-ng/primitives/core';
import { getActiveElement, useArrowNavigation } from '@radix-ng/primitives/core';
import { injectStepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';

// as button
@Directive({
    selector: 'button[rdxStepperTrigger]',
    host: {
        '[attr.tabindex]': 'itemContext.isFocusable() ? 0 : -1',
        '[attr.aria-describedby]': 'itemContext.descriptionId',
        '[attr.aria-labelledby]': 'itemContext.titleId',

        '[attr.data-state]': 'itemContext.itemState()',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.disabled]': 'itemContext.disabled() || !itemContext.isFocusable() ? "" : undefined',
        '[attr.data-disabled]': 'itemContext.disabled() || !itemContext.isFocusable() ? "" : undefined',

        '(mousedown)': 'handleMouseDown($event)',

        '(keydown.Enter)': 'handleKeyDown($event)',
        '(keydown.Space)': 'handleKeyDown($event)',
        '(keydown.ArrowLeft)': 'handleKeyDown($event)',
        '(keydown.ArrowRight)': 'handleKeyDown($event)',
        '(keydown.ArrowUp)': 'handleKeyDown($event)',
        '(keydown.ArrowDown)': 'handleKeyDown($event)'
    }
})
export class RdxStepperTriggerDirective {
    protected readonly rootContext = injectStepperRootContext();
    protected readonly itemContext = injectStepperItemContext();

    private readonly elementRef = inject(ElementRef);

    readonly stepperItems = computed(() => Array.from(this.rootContext.totalStepperItems()));

    constructor() {
        // Register/deregister this trigger's host element with the root, in DOM order.
        const element = this.elementRef.nativeElement;
        this.rootContext.totalStepperItems.set([...this.rootContext.totalStepperItems(), element]);

        inject(DestroyRef).onDestroy(() => {
            const updated = this.rootContext.totalStepperItems().filter((el: HTMLElement) => el !== element);

            this.rootContext.totalStepperItems.set(updated);
        });
    }

    handleMouseDown(event: Event) {
        const mouseEvent = event as MouseEvent;
        if (this.itemContext.disabled()) {
            return;
        }

        // handler only left mouse click
        if (mouseEvent.button !== 0) {
            return;
        }

        if (this.rootContext.linear()) {
            if (
                this.itemContext.step() <= this.rootContext.value()! ||
                this.itemContext.step() === this.rootContext.value()! + 1
            ) {
                if (!mouseEvent.ctrlKey) {
                    this.rootContext.value.set(this.itemContext.step());
                    return;
                }
            }
        } else {
            if (!mouseEvent.ctrlKey) {
                this.rootContext.value.set(this.itemContext.step());
                return;
            }
        }

        // prevent focus to avoid accidental activation
        event.preventDefault();
    }

    handleKeyDown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        event.preventDefault();

        if (this.itemContext.disabled()) {
            return;
        }

        if ((keyEvent.key === kbd.ENTER || keyEvent.key === kbd.SPACE) && !keyEvent.ctrlKey && !keyEvent.shiftKey)
            this.rootContext.value.set(this.itemContext.step());

        if ([kbd.ARROW_LEFT, kbd.ARROW_RIGHT, kbd.ARROW_UP, kbd.ARROW_DOWN].includes(keyEvent.key)) {
            useArrowNavigation(keyEvent, getActiveElement() as HTMLElement, undefined, {
                itemsArray: this.stepperItems(),
                focus: true,
                loop: false,
                arrowKeyOptions: this.rootContext.orientation(),
                dir: this.rootContext.dir()
            });
        }
    }
}
