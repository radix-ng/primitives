import {
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
    type Signal
} from '@angular/core';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';
import { injectSliderRootContext } from './slider-context';
import type { RdxSliderThumbRef } from './slider-root';
import { sliderPartStateAttributes } from './slider-state-attributes';
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
        '[attr.data-rdx-slider-percent]': 'prehydrationPercent()',
        ...sliderPartStateAttributes,
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxSliderThumb implements RdxSliderThumbRef {
    protected readonly root = injectSliderRootContext();
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /** The nested range input, set by `[rdxSliderThumbInput]`. */
    inputElement: HTMLInputElement | null = null;
    private readonly registeredInputId = signal<string | undefined>(undefined);
    readonly inputId = this.registeredInputId.asReadonly();

    /** Explicit index for this thumb (required for SSR range sliders). */
    readonly indexInput = input<number | undefined, NumberInput>(undefined, {
        alias: 'index',
        transform: (v) => (v == null ? undefined : numberAttribute(v))
    });

    /** Disables this individual thumb. */
    readonly thumbDisabled = input<boolean, BooleanInput>(false, { alias: 'disabled', transform: booleanAttribute });

    /** The position of this thumb among its siblings. */
    readonly index: Signal<number> = computed(() => {
        if (!this.root.range()) {
            return 0;
        }

        const explicitIndex = this.indexInput();
        if (explicitIndex !== undefined) {
            return explicitIndex;
        }

        return this.root.thumbIndexOf(this);
    });

    /** Whether this thumb is disabled (own state OR root disabled). */
    readonly disabled = computed(() => this.thumbDisabled() || this.root.isDisabled());

    /** The value represented by this thumb. */
    readonly value: Signal<number | undefined> = computed(() => this.root.values()[this.index()]);

    private readonly percent = computed(() => {
        const value = this.value();
        return value === undefined ? NaN : valueToPercent(value, this.root.min(), this.root.max());
    });
    private readonly insetPosition = signal<number | undefined>(undefined);
    protected readonly prehydrationPercent = computed(() => {
        const percent = this.percent();
        return this.root.prehydratingEdge() && Number.isFinite(percent) ? percent : undefined;
    });

    protected readonly thumbStyle = computed<Record<string, string | number>>(() => {
        const vertical = this.root.orientation() === 'vertical';
        const rtl = this.root.dir() === 'rtl';
        const startEdge = vertical ? 'bottom' : 'inset-inline-start';
        const crossOffset = vertical ? 'left' : 'top';
        const percent = this.percent();
        const inset = this.root.inset();
        const position = this.insetPosition();
        const serverEdge = this.root.thumbAlignment() === 'edge';

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
            [startEdge]: inset
                ? position === undefined && serverEdge
                    ? 'var(--rdx-slider-ssr-position, 0%)'
                    : `${position ?? 0}%`
                : `${percent}%`,
            [crossOffset]: '50%',
            translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`
        };
        if (inset && position === undefined) {
            style['visibility'] = serverEdge ? 'var(--rdx-slider-ssr-visibility, hidden)' : 'hidden';
        }
        if (zIndex !== undefined) {
            style['z-index'] = zIndex;
        }
        return style;
    });

    constructor() {
        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(this.root.registerThumb(this));

        afterRenderEffect({
            read: (onCleanup) => {
                const control = this.root.controlRef();
                const ResizeObserverCtor = control?.ownerDocument.defaultView?.ResizeObserver;
                if (!this.root.inset() || !control || !ResizeObserverCtor) return;
                const observer = new ResizeObserverCtor(() => this.updateInsetPosition());
                observer.observe(control);
                observer.observe(this.element);
                onCleanup(() => observer.disconnect());
            }
        });
        afterRenderEffect({
            read: () => {
                this.root.values().length;
                this.updateInsetPosition();
            }
        });
    }

    private updateInsetPosition(): void {
        const control = this.root.controlRef();
        const position =
            control && this.root.inset()
                ? getInsetThumbPositionPercent(
                      control,
                      this.element,
                      this.percent(),
                      this.root.orientation() === 'vertical'
                  )
                : undefined;
        this.insetPosition.set(position);
        this.root.setIndicatorPosition(this.index(), position);
    }

    /** @ignore */
    setInputElement(input: HTMLInputElement, id: string): void {
        this.inputElement = input;
        this.registeredInputId.set(id);
    }

    /** @ignore */
    clearInputElement(input: HTMLInputElement): void {
        if (this.inputElement !== input) {
            return;
        }

        this.inputElement = null;
        this.registeredInputId.set(undefined);
    }
}
