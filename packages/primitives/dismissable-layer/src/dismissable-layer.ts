import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    Injector,
    output,
    untracked
} from '@angular/core';
import { RdxDismissableLayerConfigToken, RdxDismissableLayersContextToken } from './dismissable-layer.config';
import { RdxEscapeKeyDown, RdxFocusOutside, RdxPointerDownOutside } from './utils';

let originalBodyPointerEvents: string;

@Directive({
    selector: '[rdxDismissableLayer]',
    exportAs: 'rdxDismissableLayer',
    hostDirectives: [RdxPointerDownOutside, RdxFocusOutside, RdxEscapeKeyDown],
    host: {
        'data-dismissable-layer': '',
        '[style]': `{
            pointerEvents: isBodyPointerEventsDisabled() ? (isPointerEventsEnabled() ? 'auto' : 'none') : undefined
        }`
    }
})
export class RdxDismissableLayer {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly context = inject(RdxDismissableLayersContextToken);
    private readonly configLayer = inject(RdxDismissableLayerConfigToken);
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Event handler called when the escape key is down.
     * Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a `pointerdown` event happens outside of the `DismissableLayer`.
     * Can be prevented.
     */
    readonly pointerDownOutside = output<PointerEvent>();

    /**
     * Event handler called when the focus moves outside of the `DismissableLayer`.
     * Can be prevented.
     */
    readonly focusOutside = output<FocusEvent>();

    /**
     * Event handler called when an interaction happens outside the `DismissableLayer`.
     * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
     * Can be prevented.
     */
    readonly interactOutside = output<PointerEvent | FocusEvent>();

    /**
     * Handler called when the `DismissableLayer` should be dismissed
     */
    readonly dismiss = output<void>();

    /**
     * When `true`, hover/focus/click interactions will be disabled on elements outside
     * the `DismissableLayer`. Users will need to click twice on outside elements to
     * interact with them: once to close the `DismissableLayer`, and again to trigger the element.
     */
    readonly disableOutsidePointerEvents = this.configLayer.disableOutsidePointerEvents;

    readonly layers = computed(() => this.context.layersRoot);

    private readonly index = computed(() => this.context.layersRoot().indexOf(this));

    protected readonly isBodyPointerEventsDisabled = computed(
        () => this.context.layersWithOutsidePointerEventsDisabled().length > 0
    );

    protected readonly isPointerEventsEnabled = computed(() => {
        const localLayers = this.layers();

        const [highestLayerWithOutsidePointerEventsDisabled] = [
            ...this.context.layersWithOutsidePointerEventsDisabled()
        ].slice(-1);

        const highestLayerWithOutsidePointerEventsDisabledIndex = localLayers().indexOf(
            highestLayerWithOutsidePointerEventsDisabled
        );

        return this.index() >= highestLayerWithOutsidePointerEventsDisabledIndex;
    });

    private readonly afterNextRender = afterNextRender(() => {
        const ownerDocument = this.elementRef.nativeElement.ownerDocument ?? globalThis.document;

        effect(
            (onCleanup) => {
                if (this.configLayer.disableOutsidePointerEvents()) {
                    if (this.context.layersWithOutsidePointerEventsDisabled().length === 0) {
                        originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
                        ownerDocument.body.style.pointerEvents = 'none';
                    }
                }

                untracked(() => this.context.layersRoot.update((v) => [...v, this]));

                onCleanup(() => {
                    if (
                        this.configLayer.disableOutsidePointerEvents() &&
                        this.context.layersWithOutsidePointerEventsDisabled.length === 1
                    ) {
                        ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
                    }
                });
            },
            { injector: this.injector }
        );
    });

    constructor() {
        this.context.layersRoot.update((v) => [...v, this]);

        inject(RdxPointerDownOutside).pointerDownOutside.subscribe((event) => {
            const isPointerDownOnBranch = this.context
                .branches()
                .some((branch) => branch.contains(event.target as HTMLElement));

            if (!this.isPointerEventsEnabled() || isPointerDownOnBranch) {
                return;
            }

            this.pointerDownOutside.emit(event);
            this.interactOutside.emit(event);

            if (!event.defaultPrevented) {
                this.dismiss.emit();
            }
        });

        inject(RdxFocusOutside).focusOutside.subscribe((event) => {
            const isFocusInBranch = this.context
                .branches()
                .some((branch) => branch.contains(event.target as HTMLElement));

            if (isFocusInBranch) {
                return;
            }

            this.focusOutside.emit(event);
            this.interactOutside.emit(event);

            if (!event.defaultPrevented) {
                this.dismiss.emit();
            }
        });

        inject(RdxEscapeKeyDown).escapeKeyDown.subscribe((event) => {
            this.escapeKeyDown.emit(event);

            if (!event.defaultPrevented) {
                event.preventDefault();
                this.dismiss.emit();
            }
        });

        this.destroyRef.onDestroy(() => {
            this.context.layersRoot.update((v) => v.filter((i) => i !== this));
        });
    }
}
