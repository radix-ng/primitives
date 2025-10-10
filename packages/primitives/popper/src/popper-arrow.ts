import {
    computed,
    createComponent,
    Directive,
    effect,
    ElementRef,
    EnvironmentInjector,
    inject,
    input,
    inputBinding,
    numberAttribute
} from '@angular/core';
import { RdxArrow } from '@radix-ng/primitives/arrow';
import { injectPopperContentWrapperContext } from './popper-content-wrapper';
import { Side } from './utils';

const OPPOSITE_SIDE: Record<Side, Side> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
};

@Directive({
    selector: '[rdxPopperArrow]',
    host: {
        '[style]': 'style()'
    }
})
export class RdxPopperArrow {
    private readonly popperContentContext = injectPopperContentWrapperContext()!;

    private readonly environmentInjector = inject(EnvironmentInjector);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly width = input(10, { transform: numberAttribute });

    readonly height = input(5, { transform: numberAttribute });

    baseSide = computed(() => OPPOSITE_SIDE[this.popperContentContext.placedSide()!]);

    protected readonly style = computed(() => {
        return {
            position: 'absolute',
            left: this.popperContentContext.arrowX() ? `${this.popperContentContext.arrowX()}px` : undefined,
            top: this.popperContentContext.arrowY() ? `${this.popperContentContext.arrowY()}px` : undefined,
            [this.baseSide()]: 0,
            transformOrigin: {
                top: '',
                right: '0 0',
                bottom: 'center 0',
                left: '100% 0'
            }[this.popperContentContext.placedSide()!],
            transform: {
                top: 'translateY(100%)',
                right: 'translateY(50%) rotate(90deg) translateX(-50%)',
                bottom: `rotate(180deg)`,
                left: 'translateY(50%) rotate(-90deg) translateX(50%)'
            }[this.popperContentContext.placedSide()!],
            visibility: this.popperContentContext.shouldHideArrow() ? 'hidden' : undefined
        };
    });

    private onCleanup = effect((onCleanup) => {
        const component = createComponent(RdxArrow, {
            environmentInjector: this.environmentInjector,
            hostElement: this.elementRef.nativeElement,
            projectableNodes: [Array.from(this.elementRef.nativeElement.childNodes)],
            bindings: [inputBinding('width', () => this.width()), inputBinding('height', () => this.height())]
        });

        component.changeDetectorRef.detectChanges();

        onCleanup(() => component.destroy());
    });
}
