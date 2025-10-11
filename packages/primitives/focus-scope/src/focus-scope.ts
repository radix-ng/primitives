import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
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
import { createContext, getActiveElement } from '@radix-ng/primitives/core';
import { createFocusScopesStack, FocusScopeAPI, removeLinks } from './stack';
import {
    AUTOFOCUS_ON_MOUNT,
    AUTOFOCUS_ON_UNMOUNT,
    EVENT_OPTIONS,
    focus,
    focusFirst,
    getTabbableCandidates,
    getTabbableEdges
} from './utils';

export interface FocusScopeContext {
    loop?: Signal<boolean>;

    trapped?: Signal<boolean>;
}

export const [injectFocusScopeContext, provideFocusScopeContext] =
    createContext<FocusScopeContext>('FocusScope Context');

const rootContext = (): FocusScopeContext => {
    const context = inject(RdxFocusScope);

    return {
        loop: context.loop,
        trapped: context.trapped
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
    readonly trapped = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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

    private readonly focusScopesStack = createFocusScopesStack();

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

                    if (this.trapped()) {
                        const handleFocusIn = (event: FocusEvent) => {
                            if (this.focusScope.paused() || !container) {
                                return;
                            }

                            const target = event.target as HTMLElement | null;
                            if (this.elementRef.nativeElement.contains(target)) {
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
                            if (!container.contains(relatedTarget)) {
                                focus(this.lastFocusedElement(), { select: true });
                            }
                        };

                        const handleMutations = () => {
                            const isLastFocusedElementExist = container.contains(this.lastFocusedElement());

                            if (!isLastFocusedElementExist) {
                                focus(container);
                            }
                        };

                        const mutationObserver = new MutationObserver(handleMutations);
                        if (container) {
                            mutationObserver.observe(container, { childList: true, subtree: true });
                        }

                        document.addEventListener('focusin', handleFocusIn);
                        document.addEventListener('focusout', handleFocusOut);

                        onCleanup(() => {
                            document.removeEventListener('focusin', handleFocusIn);
                            document.removeEventListener('focusout', handleFocusOut);
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
                    if (!container) {
                        return;
                    }

                    this.focusScopesStack.add(this.focusScope);

                    const previouslyFocusedElement = getActiveElement() as HTMLElement | null;
                    const hasFocusedCandidate = container.contains(previouslyFocusedElement);

                    if (!hasFocusedCandidate) {
                        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
                        container.addEventListener(AUTOFOCUS_ON_MOUNT, (ev: Event) => this.mountAutoFocus.emit(ev));
                        container.dispatchEvent(mountEvent);

                        if (!mountEvent.defaultPrevented) {
                            focusFirst(removeLinks(getTabbableCandidates(container)), {
                                select: true
                            });
                            if (getActiveElement() === previouslyFocusedElement) focus(container);
                        }
                    }

                    const unmountEventHandler = (ev: Event) => {
                        if (this.alive) this.unmountAutoFocus.emit(ev);
                    };
                    container.addEventListener(AUTOFOCUS_ON_UNMOUNT, unmountEventHandler);

                    onCleanup(() => {
                        container.removeEventListener(AUTOFOCUS_ON_MOUNT, (ev: Event) => this.mountAutoFocus.emit(ev));

                        const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
                        container.dispatchEvent(unmountEvent);

                        setTimeout(() => {
                            if (!unmountEvent.defaultPrevented)
                                focus(previouslyFocusedElement ?? document.body, { select: true });

                            // we need to remove the listener after we `dispatchEvent`
                            container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, unmountEventHandler);

                            this.focusScopesStack.remove(this.focusScope);
                        }, 0);
                    });
                },
                { injector: this.injector }
            );
        });
    }

    handleKeyDown(event: KeyboardEvent) {
        const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;

        const focusedElement = getActiveElement() as HTMLElement | null;

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
