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
    signal,
    untracked
} from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectCollapsiblePanelOwnerContext } from './collapsible-panel-owner-context';
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
            '!suppressOpenAnimation() && !forceIdle() && (rootContext.transitionStatus() === "starting" || (effectiveHiddenUntilFound() && hidden() !== undefined && measuredMotion() !== "animation")) ? "" : undefined',
        '[attr.data-ending-style]': '!forceIdle() && rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.hidden]': 'hidden()',
        '[style.--collapsible-panel-width]': 'width() === null ? "auto" : width() + "px"',
        '[style.--collapsible-panel-height]': 'height() === null ? "auto" : height() + "px"',
        '[style.animation-name]': 'suppressOpenAnimation() ? "none" : undefined'
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
    private revealFrame?: number;
    private skipNextOpen = false;
    private restoreRevealStyle?: () => void;
    protected readonly forceIdle = signal(false);
    protected readonly measuredMotion = signal<'transition' | 'animation' | 'none'>('none');

    protected readonly rootContext = injectCollapsibleRootContext();
    private readonly owner = (() => {
        const owner = injectCollapsiblePanelOwnerContext(true);
        return owner?.root === this.rootContext ? owner : null;
    })();

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

    private readonly effectiveKeepMounted = computed(() =>
        this.owner ? this.owner.keepMounted() : (this.keepMounted() ?? this.rootContext.keepMounted())
    );
    protected readonly effectiveHiddenUntilFound = computed(() =>
        this.owner ? this.owner.hiddenUntilFound() : (this.hiddenUntilFound() ?? this.rootContext.hiddenUntilFound())
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
        const visible = this.rootContext.open() || this.rootContext.mounted();

        if (visible) {
            return undefined;
        }

        return this.effectiveHiddenUntilFound() ? 'until-found' : '';
    });

    private readonly suppressStandaloneInitialOpen = signal(this.rootContext.open());
    protected readonly suppressOpenAnimation = computed(
        () =>
            this.rootContext.open() &&
            (this.owner?.preventInitialOpenAnimation() ?? this.suppressStandaloneInitialOpen())
    );
    private previousMeasuredOpen: boolean | undefined;

    constructor() {
        let initialized = false;
        effect(() => {
            const open = this.rootContext.open();
            if (!initialized) {
                initialized = true;
                this.suppressStandaloneInitialOpen.set(open);
            } else if (!open) {
                this.suppressStandaloneInitialOpen.set(false);
            }
        });
        const completion = this.rootContext.onOpenChangeComplete.subscribe((open) => {
            if (open !== this.rootContext.open()) return;
            this.height.set(null);
            this.width.set(null);
        });
        this.destroyRef.onDestroy(() => completion.unsubscribe());
        const unregister = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        this.destroyRef.onDestroy(unregister);

        if (!this.owner) this.insertMarker();

        const unlistenBeforeMatch = this.renderer.listen(
            this.elementRef.nativeElement,
            'beforematch',
            (event: Event) => {
                if (!this.effectiveHiddenUntilFound() || this.rootContext.open()) return;
                const node = this.elementRef.nativeElement;
                const hadStartingStyle = node.hasAttribute('data-starting-style');
                if (this.rootContext.setOpen(true, 'none', event)) {
                    this.skipNextOpen = true;
                    this.forceIdle.set(true);
                    // The browser measures its match in this same task, before Angular commits.
                    this.renderer.removeAttribute(node, 'data-starting-style');
                }
                clearTimeout(this.revealDecision);
                if (this.revealFrame !== undefined) cancelAnimationFrame(this.revealFrame);
                this.revealDecision = setTimeout(() => {
                    if (this.rootContext.open()) return;
                    this.revealFrame = requestAnimationFrame(() => {
                        this.revealFrame = undefined;
                        if (this.rootContext.open() || !this.effectiveHiddenUntilFound()) return;
                        this.skipNextOpen = false;
                        this.forceIdle.set(false);
                        if (hadStartingStyle) this.renderer.setAttribute(node, 'data-starting-style', '');
                        this.renderer.setAttribute(node, 'hidden', 'until-found');
                    });
                }, 0);
            }
        );

        this.destroyRef.onDestroy(() => {
            unlistenBeforeMatch();
            clearTimeout(this.revealDecision);
            if (this.revealFrame !== undefined) cancelAnimationFrame(this.revealFrame);
            this.restoreRevealStyle?.();
            this.removeMarker();
        });

        effect(() => {
            this.rootContext.setPanelIdState(this.id());
        });

        this.destroyRef.onDestroy(() => {
            this.rootContext.setPanelIdState(null);
        });

        if (!this.owner) {
            effect(() => this.syncRenderedState());
        }

        afterRenderEffect(() => {
            const open = this.rootContext.open();
            const status = this.rootContext.transitionStatus();
            const mounted = this.rootContext.mounted();
            const suppressed = this.suppressOpenAnimation();
            untracked(() => {
                const changed = this.previousMeasuredOpen !== open;
                this.previousMeasuredOpen = open;
                if (!open) {
                    this.restoreRevealStyle?.();
                    this.restoreRevealStyle = undefined;
                    this.forceIdle.set(false);
                } else if (status !== 'starting' && !this.skipNextOpen) {
                    this.forceIdle.set(false);
                }
                if (!mounted && !open) return;
                const previousMotion = this.measuredMotion();
                const motion = this.motionType();
                // Open-only keyframes disappear during the capture frame. Keep their motion
                // ownership until ending styles have had a chance to install the exit animation.
                if (open || motion !== 'none') this.measuredMotion.set(motion);
                if (
                    open &&
                    status === 'starting' &&
                    motion === 'none' &&
                    !this.elementRef.nativeElement.getAnimations?.().length &&
                    !this.skipNextOpen
                ) {
                    this.forceIdle.set(true);
                    this.height.set(null);
                    this.width.set(null);
                    return;
                }
                if (open && this.skipNextOpen) {
                    this.skipNextOpen = false;
                    this.updateDimensions();
                    const property = this.motionType() === 'transition' ? 'transition-duration' : 'animation-duration';
                    const style = this.elementRef.nativeElement.style;
                    const value = style.getPropertyValue(property);
                    const priority = style.getPropertyPriority(property);
                    style.setProperty(property, '0s');
                    this.restoreRevealStyle = () =>
                        value ? style.setProperty(property, value, priority) : style.removeProperty(property);
                    return;
                }
                if (
                    !open &&
                    status !== 'ending' &&
                    motion === 'none' &&
                    previousMotion === 'none' &&
                    !this.elementRef.nativeElement.getAnimations?.().length
                ) {
                    this.rootContext.finishClose();
                    return;
                }
                if ((open && status === 'starting' && !suppressed) || (!open && changed)) {
                    this.updateDimensions();
                }
            });
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

    private motionType(): 'transition' | 'animation' | 'none' {
        const styles = getComputedStyle(this.elementRef.nativeElement);
        const hasDuration = (value = '') => value.split(',').some((part) => Number.parseFloat(part) > 0);
        if (hasDuration(styles.transitionDuration)) return 'transition';
        if (
            hasDuration(styles.animationDuration) &&
            (this.suppressOpenAnimation() ||
                (styles.animationName ?? '').split(',').some((name) => name.trim() && name.trim() !== 'none'))
        )
            return 'animation';
        return 'none';
    }

    private updateDimensions(): void {
        const node = this.elementRef.nativeElement;
        // Transforms and borders are excluded by the pin's scroll-size protocol. Scrolling
        // dimensions still expose expanded children while the starting style collapses the host.
        const alignment = ['justify-content', 'align-items', 'align-content', 'justify-items'];
        const restore =
            this.motionType() === 'transition'
                ? alignment.map((property) => {
                      const value = node.style.getPropertyValue(property);
                      const priority = node.style.getPropertyPriority(property);
                      node.style.setProperty(property, 'initial', 'important');
                      return () =>
                          value
                              ? node.style.setProperty(property, value, priority)
                              : node.style.removeProperty(property);
                  })
                : [];
        try {
            this.height.set(node.scrollHeight);
            this.width.set(node.scrollWidth);
        } finally {
            restore.forEach((restoreStyle) => restoreStyle());
        }
    }
}
