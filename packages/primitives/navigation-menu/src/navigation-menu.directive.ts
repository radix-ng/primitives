import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    numberAttribute,
    OnDestroy,
    runInInjectionContext,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, map, Subject, tap, timer } from 'rxjs';
import { provideNavigationMenuContext } from './navigation-menu.token';
import { generateId, ROOT_CONTENT_DISMISS } from './utils';

// Define action types for clearer intent
export enum RdxNavigationMenuAction {
    OPEN = 'open',
    CLOSE = 'close'
}

@Directive({
    selector: '[rdxNavigationMenu]',
    standalone: true,
    providers: [provideNavigationMenuContext(RdxNavigationMenuDirective)],
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.dir]': 'dir()',
        'aria-label': 'Main',
        role: 'navigation'
    },
    exportAs: 'rdxNavigationMenu'
})
export class RdxNavigationMenuDirective implements OnDestroy {
    private readonly elementRef = inject(ElementRef);
    private readonly injector = inject(Injector);

    // State
    readonly #value = signal<string>('');
    readonly #previousValue = signal<string>('');
    readonly baseId = `rdx-nav-menu-${generateId()}`;
    readonly #indicatorTrack = signal<HTMLElement | null>(null);
    readonly #viewport = signal<HTMLElement | null>(null);
    readonly #viewportContent = signal<Map<string, any>>(new Map());
    readonly #rootNavigationMenu = signal<HTMLElement | null>(this.elementRef.nativeElement);

    readonly #userDismissedByClick = signal(false);
    userDismissedByClick = () => this.#userDismissedByClick();
    resetUserDismissed = () => this.#userDismissedByClick.set(false);

    // Delay timers
    private openTimerRef = 0;
    private closeTimerRef = 0;
    private skipDelayTimerRef = 0;
    readonly #isOpenDelayed = signal(true);

    // Pointer tracking
    readonly #isPointerOverContent = signal(false);
    readonly #isPointerOverTrigger = signal(false);
    private documentMouseLeaveHandler: ((e: Event) => void) | null = null;
    private rootContentDismissHandler: ((e: Event) => void) | null = null; // for closing menu when a link inside the content is clicked

    readonly actionSubject$ = new Subject<{ action: RdxNavigationMenuAction; itemValue?: string }>();

    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
    readonly dir = input<'ltr' | 'rtl'>('ltr');
    readonly delayDuration = input(200, { transform: numberAttribute });
    readonly skipDelayDuration = input(300, { transform: numberAttribute });
    readonly loop = input(false, { transform: booleanAttribute });

    readonly isRootMenu = true;

    // expose state as functions for the token
    value = () => this.#value();
    previousValue = () => this.#previousValue();
    rootNavigationMenu = () => this.#rootNavigationMenu();
    indicatorTrack = () => this.#indicatorTrack();
    viewport = () => this.#viewport();
    viewportContent = () => this.#viewportContent();

    // expose pointer state methods
    setTriggerPointerState = (isOver: boolean) => this.#isPointerOverTrigger.set(isOver);
    setContentPointerState = (isOver: boolean) => this.#isPointerOverContent.set(isOver);
    isPointerInSystem = () => this.#isPointerOverContent() || this.#isPointerOverTrigger();

    constructor() {
        // set up effect to clean delay timers when value changes
        effect(() => {
            const value = this.#value();
            // if value exists and menu is open
            if (value) {
                window.clearTimeout(this.skipDelayTimerRef);
                if (this.skipDelayDuration() > 0) {
                    this.#isOpenDelayed.set(false);
                }
            } else {
                // menu is closed, start skip delay timer
                window.clearTimeout(this.skipDelayTimerRef);
                this.skipDelayTimerRef = window.setTimeout(() => {
                    this.#isOpenDelayed.set(true);
                }, this.skipDelayDuration());
            }
        });

        // set up action subscription for handling open/close with debounce
        this.actionSubject$
            .pipe(
                map((config) => {
                    // use different delays for open vs close for better UX
                    const duration = config.action === RdxNavigationMenuAction.OPEN ? this.delayDuration() : 150; // Shorter close delay
                    return { ...config, duration };
                }),
                debounce((config) => timer(config.duration)),
                tap((config) => {
                    switch (config.action) {
                        case RdxNavigationMenuAction.OPEN:
                            if (config.itemValue) {
                                this.setValue(config.itemValue);
                            }
                            break;
                        case RdxNavigationMenuAction.CLOSE:
                            // only close if not hovering over any part of the system
                            if (!this.isPointerInSystem()) {
                                this.setValue('');
                            }
                            break;
                    }
                }),
                takeUntilDestroyed()
            )
            .subscribe();

        // set up document mouseleave handler to close menu when mouse leaves window
        this.documentMouseLeaveHandler = () => this.handleClose();
        document.addEventListener('mouseleave', this.documentMouseLeaveHandler);

        // listen for the custom event dispatched by RdxNavigationMenuLinkDirective
        // using runInInjectionContext as addEventListener is outside constructor/injection context
        runInInjectionContext(this.injector, () => {
            this.rootContentDismissHandler = () => this.handleClose(true); // Force close on link click
            this.elementRef.nativeElement.addEventListener(ROOT_CONTENT_DISMISS, this.rootContentDismissHandler);
        });
    }

    ngOnDestroy() {
        window.clearTimeout(this.openTimerRef);
        window.clearTimeout(this.closeTimerRef);
        window.clearTimeout(this.skipDelayTimerRef);

        // clean up document event listener
        if (this.documentMouseLeaveHandler) {
            document.removeEventListener('mouseleave', this.documentMouseLeaveHandler);
        }

        // clean up custom event listener
        if (this.rootContentDismissHandler) {
            this.elementRef.nativeElement.removeEventListener(ROOT_CONTENT_DISMISS, this.rootContentDismissHandler);
            this.rootContentDismissHandler = null;
        }
    }

    onIndicatorTrackChange(track: HTMLElement | null) {
        this.#indicatorTrack.set(track);
    }

    onViewportChange(viewport: HTMLElement | null) {
        this.#viewport.set(viewport);
    }

    onTriggerEnter(itemValue: string) {
        // skip opening if user explicitly dismissed this menu
        if (this.#userDismissedByClick() && itemValue === this.#previousValue()) {
            return;
        }

        window.clearTimeout(this.openTimerRef);
        window.clearTimeout(this.closeTimerRef);

        if (this.#isOpenDelayed()) {
            this.handleDelayedOpen(itemValue);
        } else {
            this.handleOpen(itemValue);
        }
    }

    onTriggerLeave() {
        window.clearTimeout(this.openTimerRef);
        this.startCloseTimer();
    }

    onContentEnter() {
        window.clearTimeout(this.closeTimerRef);
    }

    onContentLeave() {
        this.startCloseTimer();
    }

    /**
     * Close the menu, optionally ignoring pointer state (e.g., on Escape or link click)
     */
    handleClose(force = false) {
        if (force) {
            this.setValue('');
        } else {
            this.actionSubject$.next({ action: RdxNavigationMenuAction.CLOSE });
        }
    }

    onItemSelect(itemValue: string) {
        const wasOpen = this.#value() === itemValue;
        const newValue = wasOpen ? '' : itemValue;

        // If user is closing an open menu, mark as user-dismissed
        if (wasOpen) {
            this.#userDismissedByClick.set(true);
        } else {
            this.#userDismissedByClick.set(false);
        }

        this.setValue(newValue);
    }

    onItemDismiss() {
        this.setValue('');
    }

    onViewportContentChange(contentValue: string, contentData: any) {
        const newMap = new Map(this.#viewportContent());
        newMap.set(contentValue, contentData);
        this.#viewportContent.set(newMap);
    }

    onViewportContentRemove(contentValue: string) {
        const newMap = new Map(this.#viewportContent());
        if (newMap.has(contentValue)) {
            newMap.delete(contentValue);
            this.#viewportContent.set(newMap);
        }
    }

    private setValue(value: string) {
        // store previous value before changing
        this.#previousValue.set(this.#value());
        this.#value.set(value);

        // immediately update viewport visibility when state changes to closed
        if (!value && this.#viewport()) {
            // Ensure viewport is hidden when closed
            const viewportElement = this.#viewport();
            if (viewportElement) {
                viewportElement.style.display = 'none';
            }
        }
    }

    private startCloseTimer() {
        window.clearTimeout(this.closeTimerRef);
        this.closeTimerRef = window.setTimeout(() => {
            // only close if not hovering over any part of the system
            if (!this.isPointerInSystem()) {
                this.setValue('');
            }
        }, 150);
    }

    private handleOpen(itemValue: string) {
        window.clearTimeout(this.closeTimerRef);
        this.setValue(itemValue);
    }

    private handleDelayedOpen(itemValue: string) {
        const isOpenItem = this.#value() === itemValue;
        if (isOpenItem) {
            // if the item is already open, clear close timer
            window.clearTimeout(this.closeTimerRef);
        } else {
            // otherwise, start the open timer
            this.openTimerRef = window.setTimeout(() => {
                window.clearTimeout(this.closeTimerRef);
                this.setValue(itemValue);
            }, this.delayDuration());
        }
    }
}
