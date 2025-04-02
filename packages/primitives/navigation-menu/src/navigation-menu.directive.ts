import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    Input,
    numberAttribute,
    OnDestroy,
    signal,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, map, Subject, tap, timer } from 'rxjs';
import { provideNavigationMenuContext } from './navigation-menu.token';
import { RdxNavigationMenuAnimationStatus } from './navigation-menu.types';
import { generateId } from './utils';

// Define action types for clearer intent
export enum RdxNavigationMenuAction {
    OPEN = 'open',
    CLOSE = 'close'
}

@Directive({
    selector: '[rdxNavigationMenu]',
    providers: [provideNavigationMenuContext(RdxNavigationMenuDirective)],
    host: {
        '[attr.data-orientation]': 'orientation',
        '[attr.dir]': 'dir',
        'aria-label': 'Main',
        role: 'navigation'
    },
    exportAs: 'rdxNavigationMenu'
})
export class RdxNavigationMenuDirective implements OnDestroy {
    private readonly elementRef = inject(ElementRef);

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

    // Observable for handling actions with debounce
    readonly actionSubject$ = new Subject<{ action: RdxNavigationMenuAction; itemValue?: string }>();

    // Inputs
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() dir: 'ltr' | 'rtl' = 'ltr';
    @Input({ transform: numberAttribute }) delayDuration = 200;
    @Input({ transform: numberAttribute }) skipDelayDuration = 300;
    @Input({ transform: booleanAttribute }) loop = false;
    @Input({ transform: booleanAttribute }) cssAnimation = false;
    @Input({ transform: booleanAttribute }) cssOpeningAnimation = false;
    @Input({ transform: booleanAttribute }) cssClosingAnimation = false;

    readonly isRootMenu = true;
    readonly cssAnimationStatus: WritableSignal<RdxNavigationMenuAnimationStatus | null> = signal(null);

    // Expose state as functions for the token
    value = () => this.#value();
    previousValue = () => this.#previousValue();
    rootNavigationMenu = () => this.#rootNavigationMenu();
    indicatorTrack = () => this.#indicatorTrack();
    viewport = () => this.#viewport();
    viewportContent = () => this.#viewportContent();

    // Expose pointer state methods
    setTriggerPointerState = (isOver: boolean) => this.#isPointerOverTrigger.set(isOver);
    setContentPointerState = (isOver: boolean) => this.#isPointerOverContent.set(isOver);
    isPointerInSystem = () => this.#isPointerOverContent() || this.#isPointerOverTrigger();

    // Expose animation state for context
    getCssAnimation = () => this.cssAnimation;
    getCssOpeningAnimation = () => this.cssOpeningAnimation;
    getCssClosingAnimation = () => this.cssClosingAnimation;

    constructor() {
        // Set up effect to clean delay timers when value changes
        effect(() => {
            const value = this.#value();
            // If value exists and menu is open
            if (value) {
                window.clearTimeout(this.skipDelayTimerRef);
                if (this.skipDelayDuration > 0) {
                    this.#isOpenDelayed.set(false);
                }
            } else {
                // Menu is closed, start skip delay timer
                window.clearTimeout(this.skipDelayTimerRef);
                this.skipDelayTimerRef = window.setTimeout(() => {
                    this.#isOpenDelayed.set(true);
                }, this.skipDelayDuration);
            }
        });

        // Set up action subscription for handling open/close with debounce
        this.actionSubject$
            .pipe(
                map((config) => {
                    // Use different delays for open vs close for better UX
                    const duration = config.action === RdxNavigationMenuAction.OPEN ? this.delayDuration : 150; // Shorter close delay
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
                            // Only close if not hovering over any part of the system
                            if (!this.isPointerInSystem()) {
                                this.setValue('');
                            }
                            break;
                    }
                }),
                takeUntilDestroyed()
            )
            .subscribe();

        // Set up document mouseleave handler to close menu when mouse leaves window
        this.documentMouseLeaveHandler = () => this.handleClose();
        document.addEventListener('mouseleave', this.documentMouseLeaveHandler);
    }

    ngOnDestroy() {
        window.clearTimeout(this.openTimerRef);
        window.clearTimeout(this.closeTimerRef);
        window.clearTimeout(this.skipDelayTimerRef);

        // Clean up document event listener
        if (this.documentMouseLeaveHandler) {
            document.removeEventListener('mouseleave', this.documentMouseLeaveHandler);
        }
    }

    onIndicatorTrackChange(track: HTMLElement | null) {
        this.#indicatorTrack.set(track);
    }

    onViewportChange(viewport: HTMLElement | null) {
        this.#viewport.set(viewport);
    }

    onTriggerEnter(itemValue: string) {
        // Skip opening if user explicitly dismissed this menu
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

    handleClose() {
        this.actionSubject$.next({ action: RdxNavigationMenuAction.CLOSE });
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
        // Store previous value before changing
        this.#previousValue.set(this.#value());
        this.#value.set(value);
    }

    private startCloseTimer() {
        window.clearTimeout(this.closeTimerRef);
        this.closeTimerRef = window.setTimeout(() => {
            // Only close if not hovering over any part of the system
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
            // If the item is already open, clear close timer
            window.clearTimeout(this.closeTimerRef);
        } else {
            // Otherwise, start the open timer
            this.openTimerRef = window.setTimeout(() => {
                window.clearTimeout(this.closeTimerRef);
                this.setValue(itemValue);
            }, this.delayDuration);
        }
    }
}
