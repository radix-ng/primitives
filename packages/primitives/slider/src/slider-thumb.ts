import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    signal,
    untracked
} from '@angular/core';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';
import { injectSliderRootContext } from './slider-context';
import { RdxSliderThumbRef } from './slider-root';
import { getInsetThumbPositionPercent, valueToPercent } from './slider.utils';

/**
 * A draggable handle. Render one per value; place an `input[rdxSliderThumbInput]`
 * inside it for keyboard, accessibility and form submission.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'div[rdxSliderThumb]',
    exportAs: 'rdxSliderThumb',
    host: {
        '[style]': 'thumbStyle()',
        '[attr.data-index]': 'index()',
        '[attr.data-orientation]': 'root.orientation()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-dragging]': 'root.dragging() ? "" : undefined',
        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class RdxSliderThumb implements RdxSliderThumbRef {
    protected readonly root = injectSliderRootContext();
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /** The nested range input, set by `[rdxSliderThumbInput]`. */
    inputElement: HTMLInputElement | null = null;

    /** Explicit index for this thumb (required for SSR range sliders). */
    readonly indexInput = input<number | undefined, NumberInput>(undefined, {
        alias: 'index',
        transform: (v) => (v == null ? undefined : numberAttribute(v))
    });

    /** Disables this individual thumb. */
    readonly thumbDisabled = input<boolean, BooleanInput>(false, { alias: 'disabled', transform: booleanAttribute });

    /** The position of this thumb among its siblings. */
    readonly index = computed(() => this.indexInput() ?? this.root.thumbIndexOf(this));

    /** Whether this thumb is disabled (own state OR root disabled). */
    readonly disabled = computed(() => this.thumbDisabled() || this.root.isDisabled());

    /** The value represented by this thumb. */
    readonly value = computed<number | undefined>(() => this.root.values()[this.index()]);

    private readonly percent = computed(() => {
        const value = this.value();
        return value === undefined ? NaN : valueToPercent(value, this.root.min(), this.root.max());
    });
    private readonly insetPosition = signal<number | undefined>(undefined);

    protected readonly thumbStyle = computed<Record<string, string | number>>(() => {
        const vertical = this.root.orientation() === 'vertical';
        const rtl = this.root.dir() === 'rtl';
        const startEdge = vertical ? 'bottom' : 'inset-inline-start';
        const crossOffset = vertical ? 'left' : 'top';
        const percent = this.percent();
        const inset = this.root.inset();
        const position = this.insetPosition();

        if (!Number.isFinite(percent)) {
            return { position: 'absolute', visibility: 'hidden' };
        }

        const index = this.index();
        let zIndex: number | undefined;
        if (this.root.range()) {
            if (this.root.active() === index) {
                zIndex = 2;
            } else if (this.root.lastUsedThumbIndex() === index) {
                zIndex = 1;
            }
        } else if (this.root.active() === index) {
            zIndex = 1;
        }

        const style: Record<string, string | number> = {
            position: 'absolute',
            [startEdge]: inset ? `${position ?? 0}%` : `${percent}%`,
            [crossOffset]: '50%',
            translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`
        };
        if (inset && position === undefined) {
            style['visibility'] = 'hidden';
        }
        if (zIndex !== undefined) {
            style['z-index'] = zIndex;
        }
        return style;
    });

    constructor() {
        // Registration is DOM-order sorted on the root and reads no inputs, so the constructor
        // (where the host element already exists) is the right place; cleanup goes via DestroyRef.
        this.root.registerThumb(this);
        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(() => this.root.unregisterThumb(this));

        afterNextRender(() => {
            const win = this.root.getOwnerWindow();
            const ResizeObserverCtor = (win as (Window & { ResizeObserver?: typeof ResizeObserver }) | undefined)
                ?.ResizeObserver;
            if (!ResizeObserverCtor) {
                this.updateInsetPosition();
                return;
            }

            const observer = new ResizeObserverCtor(() => this.updateInsetPosition());
            const control = this.root.controlRef();
            if (control) {
                observer.observe(control);
            }
            observer.observe(this.element);
            destroyRef.onDestroy(() => observer.disconnect());
        });

        afterRenderEffect(() => {
            this.root.inset();
            this.percent();
            this.index();
            this.root.values();
            untracked(() => queueMicrotask(() => this.updateInsetPosition()));
        });
    }

    private updateInsetPosition(): void {
        if (!this.root.inset()) {
            this.insetPosition.set(undefined);
            return;
        }

        const control = this.root.controlRef();
        if (!control) {
            return;
        }

        const position = getInsetThumbPositionPercent(
            control,
            this.element,
            this.percent(),
            this.root.orientation() === 'vertical'
        );
        this.insetPosition.set(position);
        this.root.setIndicatorPosition(this.index(), position);
    }

    protected onPointerDown(event: PointerEvent): void {
        if (this.disabled()) {
            return;
        }
        const index = this.index();
        this.root.pressedThumbIndex = index;

        const axis = this.root.orientation() === 'horizontal' ? 'x' : 'y';
        const rect = this.element.getBoundingClientRect();
        const midpoint = axis === 'x' ? (rect.left + rect.right) / 2 : (rect.top + rect.bottom) / 2;
        const pointer = axis === 'x' ? event.clientX : event.clientY;
        this.root.pressedThumbCenterOffset = pointer - midpoint;

        if (this.inputElement) {
            this.root.pressedInput = this.inputElement;
        }
    }
}
