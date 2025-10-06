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
import { injectPopperContentContext } from './popper-content-wrapper';

@Directive({
    selector: '[rdxPopperArrow]',
    host: {
        '[style]': 'style()'
    }
})
export class RdxPopperArrow {
    private readonly popperContentContext = injectPopperContentContext()!;

    private readonly environmentInjector = inject(EnvironmentInjector);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly width = input(10, { transform: numberAttribute });

    readonly height = input(5, { transform: numberAttribute });

    private readonly transformOrigin = computed(() => {
        switch (this.popperContentContext.placedSide()) {
            case 'bottom':
                return 'center 0';
            case 'left':
                return '100% 0';
            case 'right':
                return '0 0';
            case 'top':
                return '';
        }
        return;
    });

    private readonly transform = computed(() => {
        switch (this.popperContentContext.placedSide()) {
            case 'bottom':
                return 'rotate(180deg)';
            case 'left':
                return 'translateY(50%) rotate(-90deg) translateX(50%)';
            case 'right':
                return 'translateY(50%) rotate(90deg) translateX(-50%)';
            case 'top':
                return 'translateY(100%)';
        }
        return;
    });

    protected readonly style = computed(() => {
        const side = this.popperContentContext.placedSide();
        const x = this.popperContentContext.arrowX();
        const y = this.popperContentContext.arrowY();

        const staticSide = side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : side === 'left' ? 'right' : 'left';

        const s: Record<string, any> = {
            display: 'block',
            position: 'absolute',
            transformOrigin: this.transformOrigin(),
            transform: this.transform(),
            visibility: this.popperContentContext.shouldHideArrow() ? 'hidden' : undefined
        };

        if (x != null) s['left'] = `${x}px`;
        if (y != null) s['top'] = `${y}px`;

        s[staticSide] = '0';

        return s;
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
