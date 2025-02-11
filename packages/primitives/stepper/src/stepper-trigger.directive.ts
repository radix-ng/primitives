import { computed, Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { injectStepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';
import { getActiveElement } from './utils/getActiveElement';
import { useArrowNavigation } from './utils/useArrowNavigation';

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
        '(keydown)': 'handleKeyDown($event)'
    }
})
export class RdxStepperTriggerDirective implements OnInit, OnDestroy {
    protected readonly rootContext = injectStepperRootContext();
    protected readonly itemContext = injectStepperItemContext();

    private readonly elementRef = inject(ElementRef);

    readonly stepperItems = computed(() => Array.from(this.rootContext.totalStepperItems()));

    ngOnInit() {
        const current = this.rootContext.totalStepperItems();
        this.rootContext.totalStepperItems.set([...current, this.elementRef.nativeElement]);
    }

    ngOnDestroy() {
        const current = this.rootContext.totalStepperItems();
        const updated = current.filter((el: HTMLElement) => el !== this.elementRef.nativeElement);

        this.rootContext.totalStepperItems.set(updated);
    }

    handleMouseDown(event: MouseEvent) {
        if (this.itemContext.disabled()) {
            return;
        }

        // handler only left mouse click
        if (event.button !== 0) {
            return;
        }

        if (this.rootContext.linear()) {
            if (
                this.itemContext.step() <= this.rootContext.value()! ||
                this.itemContext.step() === this.rootContext.value()! + 1
            ) {
                if (!event.ctrlKey) {
                    this.rootContext.value.set(this.itemContext.step());
                    return;
                }
            }
        } else {
            if (!event.ctrlKey) {
                this.rootContext.value.set(this.itemContext.step());
                return;
            }
        }

        // prevent focus to avoid accidental activation
        event.preventDefault();
    }

    handleKeyDown(event: KeyboardEvent) {
        event.preventDefault();

        if (this.itemContext.disabled()) {
            return;
        }

        if (
            event.key === 'Enter' ||
            event.key === 'Space' ||
            event.key === ' ' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight' ||
            event.key === 'ArrowUp' ||
            event.key === 'ArrowDown'
        ) {
            if (
                (event.key === 'Enter' || event.key === 'Space' || event.key === ' ') &&
                !event.ctrlKey &&
                !event.shiftKey
            )
                this.rootContext.value.set(this.itemContext.step());

            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                useArrowNavigation(event, getActiveElement() as HTMLElement, undefined, {
                    itemsArray: this.stepperItems() as HTMLElement[],
                    focus: true,
                    loop: false,
                    arrowKeyOptions: this.rootContext.orientation(),
                    dir: this.rootContext.dir()
                });
            }
        }
    }
}
