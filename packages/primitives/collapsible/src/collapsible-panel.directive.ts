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
    Renderer2,
    signal
} from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
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
        '[attr.id]': 'rootContext.panelId()',
        '[attr.data-open]': 'rootContext.open() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.open() ? undefined : ""',
        '[attr.data-starting-style]':
            '(rootContext.transitionStatus() === "starting" || (effectiveHiddenUntilFound() && hidden() !== undefined)) ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.hidden]': 'hidden()',
        '[style.--collapsible-panel-width.px]': 'width()',
        '[style.--collapsible-panel-height.px]': 'height()'
    }
})
export class RdxCollapsiblePanelDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly destroyRef = inject(DestroyRef);
    private readonly marker = this.renderer.createComment('rdx-collapsible-panel');

    private parentNode: Node | null = null;
    private isAttached = true;
    private revealDecision?: ReturnType<typeof setTimeout>;

    protected readonly rootContext = injectCollapsibleRootContext();

    /**
     * Optional explicit panel id. When set, the trigger's `aria-controls` points to this id.
     *
     * @group Props
     */
    readonly id = input<string | undefined>(undefined, { alias: 'id' });

    /**
     * Whether to keep the element in the DOM while the panel is closed.
     * When `true`, the closed panel keeps its element and receives the `hidden` attribute once the
     * close transition finishes.
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

    private readonly effectiveKeepMounted = computed(() => this.keepMounted() ?? this.rootContext.keepMounted());
    protected readonly effectiveHiddenUntilFound = computed(
        () => this.hiddenUntilFound() ?? this.rootContext.hiddenUntilFound()
    );

    readonly height = signal<number | null>(null);
    readonly width = signal<number | null>(null);

    /** Whether the native Panel host remains attached. Angular child views currently stay alive. */
    readonly shouldRender = computed(
        () =>
            this.effectiveKeepMounted() ||
            this.effectiveHiddenUntilFound() ||
            this.rootContext.mounted() ||
            this.rootContext.open()
    );

    /**
     * The `hidden` attribute value. The panel is shown while open or while its exit transition runs.
     * A kept-mounted panel remains in the DOM but is still hidden while closed.
     */
    readonly hidden = computed<'' | 'until-found' | undefined>(() => {
        const visible = this.rootContext.open() || this.rootContext.transitionStatus() === 'ending';

        if (visible) {
            return undefined;
        }

        return this.effectiveHiddenUntilFound() ? 'until-found' : '';
    });

    /**
     * The first measurement (the initial mount) must not re-enable animations, so an element that
     * mounts already open renders at its final size without playing the open animation.
     */
    private isFirstMeasure = true;
    private originalStyles?: { transitionDuration: string; animationName: string };

    constructor() {
        const unregister = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        this.destroyRef.onDestroy(unregister);

        this.insertMarker();

        const unlistenBeforeMatch = this.renderer.listen(
            this.elementRef.nativeElement,
            'beforematch',
            (event: Event) => {
                if (!this.effectiveHiddenUntilFound() || this.rootContext.open()) return;
                this.rootContext.setOpen(true, 'none', event);
                clearTimeout(this.revealDecision);
                this.revealDecision = setTimeout(() => {
                    if (!this.rootContext.open() && this.effectiveHiddenUntilFound()) {
                        this.renderer.setAttribute(this.elementRef.nativeElement, 'hidden', 'until-found');
                    }
                }, 0);
            }
        );

        this.destroyRef.onDestroy(() => {
            unlistenBeforeMatch();
            clearTimeout(this.revealDecision);
            this.removeMarker();
        });

        effect(() => {
            this.rootContext.setPanelIdState(this.id());
        });

        this.destroyRef.onDestroy(() => {
            this.rootContext.setPanelIdState(null);
        });

        effect(() => {
            this.syncRenderedState();
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

    private insertMarker(): void {
        const host = this.elementRef.nativeElement;
        const parent = this.renderer.parentNode(host) as Node | null;

        if (!parent) {
            return;
        }

        this.parentNode = parent;
        this.renderer.insertBefore(parent, this.marker, host);
    }

    private removeMarker(): void {
        const parent = this.renderer.parentNode(this.marker) as Node | null;

        if (parent) {
            this.renderer.removeChild(parent, this.marker);
        }
    }

    private syncRenderedState(): void {
        const parent = this.parentNode;

        if (!parent) {
            return;
        }

        const host = this.elementRef.nativeElement;
        const shouldRender = this.shouldRender();

        if (shouldRender && !this.isAttached) {
            this.renderer.insertBefore(parent, host, this.renderer.nextSibling(this.marker));
            this.isAttached = true;
            return;
        }

        if (!shouldRender && this.isAttached) {
            this.renderer.removeChild(parent, host);
            this.isAttached = false;
        }
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
