import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    untracked
} from '@angular/core';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

/**
 * Coerces a collapsible boolean input that distinguishes "not set" (`undefined`) from `false`,
 * so the Panel only overrides the shared context value when the consumer passes the input.
 */
const optionalBoolean = (value: BooleanInput | undefined): boolean | undefined =>
    value === undefined ? undefined : booleanAttribute(value);

/**
 * A panel with the collapsible contents.
 */
@Directive({
    selector: '[rdxCollapsiblePanel]',
    host: {
        '[id]': 'rootContext.panelId()',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.hidden]': 'hidden()',
        '[style.--collapsible-panel-width.px]': 'width()',
        '[style.--collapsible-panel-height.px]': 'height()'
    }
})
export class RdxCollapsiblePanelDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly rootContext = injectCollapsibleRootContext()!;

    /**
     * Whether to keep the element in the DOM while the panel is closed.
     * When `true`, the closed panel keeps its element (no `hidden` attribute) so the consumer's
     * `data-closed` CSS is responsible for visually collapsing it.
     *
     * @group Props
     * @defaultValue false
     */
    readonly keepMounted = input<boolean | undefined, BooleanInput | undefined>(undefined, {
        transform: optionalBoolean
    });

    /**
     * Allows the browser's built-in page search to find and expand the panel contents.
     * When `true`, the closed panel uses `hidden="until-found"` instead of plain `hidden`.
     *
     * @group Props
     * @defaultValue false
     */
    readonly hiddenUntilFound = input<boolean | undefined, BooleanInput | undefined>(undefined, {
        transform: optionalBoolean
    });

    readonly height = signal<number | null>(null);
    readonly width = signal<number | null>(null);

    /**
     * The `hidden` attribute value. The panel is shown while open or while its exit transition runs;
     * a kept-mounted panel stays visible (the consumer collapses it via CSS); otherwise the closed
     * panel is hidden — with `until-found` when find-in-page support is requested.
     */
    readonly hidden = computed<'' | 'until-found' | undefined>(() => {
        const visible = this.rootContext.open() || this.rootContext.transitionStatus() === 'ending';

        if (visible || this.rootContext.keepMounted()) {
            return undefined;
        }

        return this.rootContext.hiddenUntilFound() ? 'until-found' : '';
    });

    /**
     * The first measurement (the initial mount) must not re-enable animations, so an element that
     * mounts already open renders at its final size without playing the open animation.
     */
    private isFirstMeasure = true;
    private originalStyles?: { transitionDuration: string; animationName: string };

    constructor() {
        const unregister = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(unregister);

        // Forward the Panel inputs into the shared context, but only when the consumer actually
        // sets them — so Accordion's context writes are never clobbered by the Panel defaults.
        effect(() => {
            const keepMounted = this.keepMounted();
            if (keepMounted !== undefined) {
                untracked(() => this.rootContext.keepMounted.set(keepMounted));
            }
        });

        effect(() => {
            const hiddenUntilFound = this.hiddenUntilFound();
            if (hiddenUntilFound !== undefined) {
                untracked(() => this.rootContext.hiddenUntilFound.set(hiddenUntilFound));
            }
        });

        // `afterRenderEffect` runs after the DOM is committed (but before paint) with the settled
        // `open` state — no `requestAnimationFrame` race — and is a no-op during SSR.
        afterRenderEffect(() => {
            // Re-measure whenever the open state flips; the panel is visible at that point (during
            // an exit it is kept rendered by the `ending` transition phase).
            this.rootContext.open();
            this.updateDimensions();
        });
    }

    private updateDimensions(): void {
        const node = this.elementRef.nativeElement;
        if (!node) return;

        this.originalStyles ??= {
            transitionDuration: node.style.transitionDuration,
            animationName: node.style.animationName
        };

        // Block any animation/transition so we can measure the element at its natural size.
        node.style.transitionDuration = '0s';
        node.style.animationName = 'none';

        // Let the element take its natural height while measuring, so a `height` bound to the very
        // variable we are computing (the Base UI collapse pattern) does not feed back into itself.
        const previousHeight = node.style.height;
        node.style.height = 'auto';

        const rect = node.getBoundingClientRect();
        this.height.set(rect.height);
        this.width.set(rect.width);

        node.style.height = previousHeight;

        // Re-enable the original animation, unless this is the very first (mount) measurement.
        if (!this.isFirstMeasure) {
            node.style.transitionDuration = this.originalStyles.transitionDuration;
            node.style.animationName = this.originalStyles.animationName;
        }

        this.isFirstMeasure = false;
    }
}
