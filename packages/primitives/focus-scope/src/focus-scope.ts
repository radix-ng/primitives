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
    Signal,
    signal
} from '@angular/core';
import { BooleanInput, createContext, getActiveElement } from '@radix-ng/primitives/core';
import { RdxFocusScopeConfigToken } from './focus-scope.config';
import { createFocusScopesStack, FocusScopeAPI } from './stack';
import {
    AUTOFOCUS_ON_MOUNT,
    AUTOFOCUS_ON_UNMOUNT,
    composedContains,
    EVENT_OPTIONS,
    focus,
    focusFirst,
    getEventTarget,
    getTabbableCandidates,
    getTabbableEdges
} from './utils';

export interface FocusScopeContext {
    loop?: Signal<boolean>;

    trapped?: Signal<boolean>;
}

export const [injectFocusScopeContext, provideFocusScopeContext] = createContext<FocusScopeContext>(
    'FocusScope Context',
    'utils/focus-scope'
);

const rootContext = (): FocusScopeContext => {
    const context = inject(RdxFocusScope);

    return {
        loop: context.loop,
        trapped: context.isTrapped
    };
};

/**
 * @group Components
 */
@Directive({
    selector: '[rdxFocusScope]',
    providers: [provideFocusScopeContext(rootContext)],
    host: {
        tabindex: '-1',
        '(keydown)': 'handleKeyDown($event)'
    }
})
export class RdxFocusScope {
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly config = inject(RdxFocusScopeConfigToken);

    /** The host's owner `Document` — all focus listeners / reads are scoped here, never global `document`. */
    private readonly ownerDocument = this.elementRef.nativeElement.ownerDocument ?? document;

    /**
     * When `true`, tabbing from last item will focus first tabbable
     * and shift+tab from first item will focus last tababble.
     *
     * @group Props
     * @defaultValue false
     */
    readonly loop = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, focus cannot escape the focus scope via keyboard,
     * pointer, or a programmatic focus.
     *
     * @group Props
     * @defaultValue false
     */
    readonly trapped = input<boolean | undefined, BooleanInput | undefined>(undefined, {
        transform: (value) => (value === undefined ? undefined : booleanAttribute(value))
    });

    readonly isTrapped = computed(() => this.trapped() ?? this.config.trapped());

    /**
     * Event handler called when auto-focusing on mount.
     * Can be prevented.
     *
     * @group Emits
     */
    readonly mountAutoFocus = output<Event>();

    /**
     * Event handler called when auto-focusing on unmount.
     * Can be prevented.
     *
     * @group Emits
     */
    readonly unmountAutoFocus = output<Event>();

    readonly lastFocusedElement = signal<HTMLElement | null>(null);

    private readonly focusScopesStack = createFocusScopesStack(this.ownerDocument);

    readonly focusScope: FocusScopeAPI = {
        paused: signal(false),
        pause: () => this.focusScope.paused.set(true),
        resume: () => this.focusScope.paused.set(false)
    };

    private alive = true;

    constructor() {
        this.destroyRef.onDestroy(() => {
            this.alive = false;
        });

        afterNextRender(() => {
            effect(
                (onCleanup) => {
                    const container = this.elementRef.nativeElement;

                    if (this.isTrapped()) {
                        const handleFocusIn = (event: FocusEvent) => {
                            if (this.focusScope.paused() || !container) {
                                return;
                            }

                            const target = getEventTarget(event) as HTMLElement | null;
                            if (composedContains(container, target)) {
                                this.lastFocusedElement.set(target);
                            } else {
                                focus(this.lastFocusedElement(), { select: true });
                            }
                        };

                        const handleFocusOut = (event: FocusEvent) => {
                            if (this.focusScope.paused() || !container) {
                                return;
                            }
                            const relatedTarget = event.relatedTarget as HTMLElement | null;

                            // A `focusout` event with a `null` `relatedTarget` will happen in at least two cases:
                            //
                            // 1. When the user switches app/tabs/windows/the browser itself loses focus.
                            // 2. In Google Chrome, when the focused element is removed from the DOM.
                            //
                            // We let the browser do its thing here because:
                            //
                            // 1. The browser already keeps a memory of what's focused for when the page gets refocused.
                            // 2. In Google Chrome, if we try to focus the deleted focused element (as per below), it
                            //    throws the CPU to 100%, so we avoid doing anything for this reason here too.
                            if (relatedTarget === null) return;

                            // If the focus has moved to an actual legitimate element (`relatedTarget !== null`)
                            // that is outside the container, we move focus to the last valid focused element inside.
                            if (!composedContains(container, relatedTarget)) {
                                focus(this.lastFocusedElement(), { select: true });
                            }
                        };

                        const handleMutations = () => {
                            const isLastFocusedElementExist = composedContains(container, this.lastFocusedElement());

                            if (!isLastFocusedElementExist) {
                                focus(container);
                            }
                        };

                        const mutationObserver = new MutationObserver(handleMutations);
                        if (container) {
                            mutationObserver.observe(container, { childList: true, subtree: true });
                        }

                        this.ownerDocument.addEventListener('focusin', handleFocusIn);
                        this.ownerDocument.addEventListener('focusout', handleFocusOut);

                        onCleanup(() => {
                            this.ownerDocument.removeEventListener('focusin', handleFocusIn);
                            this.ownerDocument.removeEventListener('focusout', handleFocusOut);
                            mutationObserver.disconnect();
                        });
                    }
                },
                { injector: this.injector }
            );

            effect(
                async (onCleanup) => {
                    const container = this.elementRef.nativeElement;

                    await Promise.resolve();
                    if (!container || !this.alive) {
                        return;
                    }

                    this.focusScopesStack.add(this.focusScope);

                    const previouslyFocusedElement = getActiveElement(this.ownerDocument) as HTMLElement | null;
                    const hasFocusedCandidate = composedContains(container, previouslyFocusedElement);
                    const mountEventHandler = (ev: Event) => {
                        if (this.alive) this.mountAutoFocus.emit(ev);
                    };

                    if (!hasFocusedCandidate) {
                        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
                        container.addEventListener(AUTOFOCUS_ON_MOUNT, mountEventHandler);
                        container.dispatchEvent(mountEvent);

                        if (!mountEvent.defaultPrevented) {
                            focusFirst(getTabbableCandidates(container), {
                                select: true,
                                root: this.ownerDocument
                            });
                            if (getActiveElement(this.ownerDocument) === previouslyFocusedElement) focus(container);
                        }
                    }

                    const unmountEventHandler = (ev: Event) => {
                        if (this.alive) this.unmountAutoFocus.emit(ev);
                    };
                    container.addEventListener(AUTOFOCUS_ON_UNMOUNT, unmountEventHandler);

                    onCleanup(() => {
                        container.removeEventListener(AUTOFOCUS_ON_MOUNT, mountEventHandler);

                        const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
                        container.dispatchEvent(unmountEvent);

                        // Queue the return-focus on the owner window's animation frame (not `setTimeout`),
                        // so it runs after the unmounting paint settles (ADR 0017 Phase 1a queued focus).
                        const view = this.ownerDocument.defaultView ?? globalThis;
                        view.requestAnimationFrame(() => {
                            // An enclosing focus manager can override the return target (ADR 0017
                            // `returnFocus`): `false` suppresses it, an element returns there explicitly
                            // (bypassing the moved-focus guard), `undefined` keeps the default behavior.
                            const override = this.config.returnFocus?.();
                            if (override !== false && !unmountEvent.defaultPrevented) {
                                if (override) {
                                    focus(override, { select: true });
                                } else if (!this.shouldPreserveMovedFocus()) {
                                    focus(previouslyFocusedElement ?? this.ownerDocument.body, { select: true });
                                }
                            }

                            // we need to remove the listener after we `dispatchEvent`
                            container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, unmountEventHandler);

                            this.focusScopesStack.remove(this.focusScope);
                        });
                    });
                },
                { injector: this.injector }
            );
        });
    }

    /**
     * Whether the interaction that unmounted this scope already moved focus to a legitimate element
     * **outside** it — e.g. an outside press onto an interactive control in a non-modal layer (ADR 0017
     * §2, finding #3). Returning focus to the previously-focused element would then *steal* it back from
     * what the user just acted on. Focus that fell to `<body>` / `null` (a backdrop press, Escape, or the
     * focused element being removed) is **not** "moved" — return focus normally so keyboard users land
     * back on the trigger. The page never scroll-jumps either way: {@link focus} uses `preventScroll`.
     */
    private shouldPreserveMovedFocus(): boolean {
        const active = getActiveElement(this.ownerDocument) as HTMLElement | null;
        return (
            !!active && active !== this.ownerDocument.body && !composedContains(this.elementRef.nativeElement, active)
        );
    }

    handleKeyDown(event: KeyboardEvent) {
        // Only a looping or trapped scope polices Tab at its edges. A plain non-modal scope must let Tab
        // through so the browser can reach whatever follows the host — e.g. the hidden outer focus guards
        // `RdxFloatingFocusManager` places around it (calling `preventDefault()` here would fire first and
        // strand focus at the boundary, defeating the guard). A paused scope (a nested scope took over)
        // also stands down so it can't double-handle a bubbled Tab. Mirrors Base UI / Radix `FocusScope`:
        // `if ((!loop && !trapped) || focusScope.paused) return`.
        if ((!this.loop() && !this.isTrapped()) || this.focusScope.paused()) {
            return;
        }

        const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;

        const focusedElement = getActiveElement(this.ownerDocument) as HTMLElement | null;

        if (isTabKey && focusedElement) {
            const container = event.currentTarget as HTMLElement;

            const [first, last] = getTabbableEdges(container);
            const hasTabbableElementsInside = first && last;

            // we can only wrap focus if we have tabbable edges
            if (!hasTabbableElementsInside) {
                if (focusedElement === container) event.preventDefault();
            } else {
                if (!event.shiftKey && focusedElement === last) {
                    event.preventDefault();
                    if (this.loop()) {
                        focus(first, { select: true });
                    }
                } else if (event.shiftKey && focusedElement === first) {
                    event.preventDefault();
                    if (this.loop()) {
                        focus(last, { select: true });
                    }
                }
            }
        }
    }
}
