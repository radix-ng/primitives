import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    output,
    untracked
} from '@angular/core';
import { RdxDismissableLayerConfigToken, RdxDismissableLayersContextToken } from './dismissable-layer.config';
import { RdxEscapeKeyDown, RdxFocusOutside, RdxPointerDownOutside } from './utils';

/**
 * Shared across all layers. Holds the body's original `pointer-events` value while at least one
 * layer disables outside pointer events. `null` means the body is not currently overridden — it
 * doubles as the "ownership" flag so stacked layers don't overwrite the saved original with
 * `none`.
 */
let originalBodyPointerEvents: string | null = null;

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
    private readonly destroyRef = inject(DestroyRef);

    private readonly context = inject(RdxDismissableLayersContextToken);
    private readonly config = inject(RdxDismissableLayerConfigToken);

    private readonly rdxPointerDownOutside = inject(RdxPointerDownOutside);
    private readonly rdxFocusOutside = inject(RdxFocusOutside);
    private readonly rdxEscapeKeyDown = inject(RdxEscapeKeyDown);

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
    readonly disableOutsidePointerEvents = input(this.config.disableOutsidePointerEvents(), {
        transform: booleanAttribute
    });

    protected readonly isBodyPointerEventsDisabled = computed(
        () => this.context.layersWithOutsidePointerEventsDisabled().length > 0
    );

    protected readonly isPointerEventsEnabled = computed(() => {
        const layers = this.context.layersRoot();
        const disabledLayers = this.context.layersWithOutsidePointerEventsDisabled();
        const highestDisabledLayer = disabledLayers[disabledLayers.length - 1];

        return this.index() >= layers.indexOf(highestDisabledLayer);
    });

    private readonly index = computed(() => this.context.layersRoot().indexOf(this));

    /** The topmost layer in the stack — the only one that should react to the Escape key. */
    private readonly isHighestLayer = computed(() => {
        const layers = this.context.layersRoot();
        return layers.indexOf(this) === layers.length - 1;
    });

    constructor() {
        this.context.layersRoot.update((v) => [...v, this]);
        this.destroyRef.onDestroy(() => {
            this.context.layersRoot.update((v) => v.filter((i) => i !== this));
        });

        this.setupBodyPointerEvents();

        this.rdxPointerDownOutside.pointerDownOutside.subscribe((event: PointerEvent) => {
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

        this.rdxFocusOutside.focusOutside.subscribe((event: FocusEvent) => {
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

        this.rdxEscapeKeyDown.escapeKeyDown.subscribe((event: KeyboardEvent) => {
            // Only the topmost layer is dismissed by Escape; stacked layers close one at a time.
            if (!this.isHighestLayer()) {
                return;
            }

            this.escapeKeyDown.emit(event);

            if (!event.defaultPrevented) {
                event.preventDefault();
                this.dismiss.emit();
            }
        });
    }

    /**
     * Toggles `pointer-events: none` on the document body while any layer has
     * `disableOutsidePointerEvents`. Ownership is shared across all layers via
     * {@link originalBodyPointerEvents}: the original value is saved only on the global
     * `0 -> >0` transition and restored only when the count returns to `0`.
     */
    private setupBodyPointerEvents(): void {
        afterNextRender(() => {
            const ownerDocument = this.elementRef.nativeElement.ownerDocument ?? globalThis.document;

            effect(
                (onCleanup) => {
                    const disabledCount = this.context.layersWithOutsidePointerEventsDisabled().length;

                    if (disabledCount > 0 && originalBodyPointerEvents === null) {
                        originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
                        ownerDocument.body.style.pointerEvents = 'none';
                    }

                    onCleanup(() => {
                        const remaining = untracked(() => this.context.layersWithOutsidePointerEventsDisabled().length);
                        if (remaining === 0 && originalBodyPointerEvents !== null) {
                            ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
                            originalBodyPointerEvents = null;
                        }
                    });
                },
                { injector: this.injector }
            );
        });
    }
}
