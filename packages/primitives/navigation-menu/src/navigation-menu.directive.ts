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
import { injectDocument, injectWindow } from '@radix-ng/primitives/core';
import { debounce, map, Subject, tap, timer } from 'rxjs';
import { provideNavigationMenuContext } from './navigation-menu.token';
import { RdxNavigationMenuAnimationStatus } from './navigation-menu.types';
import { generateId } from './utils';

// define action types for clearer intent
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
    private readonly document = injectDocument();
    private readonly window = injectWindow();

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

    // delay timers
    private openTimerRef = 0;
    private closeTimerRef = 0;
    private skipDelayTimerRef = 0;
    private recentlyActivatedTimerRef = 0;
    private readonly recentlyActivatedItem = signal<string | null>(null);
    readonly #isOpenDelayed = signal(true);

    // pointer tracking
    readonly #isPointerOverContent = signal(false);
    readonly #isPointerOverTrigger = signal(false);
    private documentMouseLeaveHandler: ((e: Event) => void) | null = null;

    readonly actionSubject$ = new Subject<{ action: RdxNavigationMenuAction; itemValue?: string }>();

    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() dir: 'ltr' | 'rtl' = 'ltr';
    @Input({ transform: numberAttribute }) clickIgnoreDuration = 250;
    @Input({ transform: numberAttribute }) delayDuration = 200;
    @Input({ transform: numberAttribute }) skipDelayDuration = 300;
    @Input({ transform: booleanAttribute }) loop = false;
    @Input({ transform: booleanAttribute }) cssAnimation = false;
    @Input({ transform: booleanAttribute }) cssOpeningAnimation = false;
    @Input({ transform: booleanAttribute }) cssClosingAnimation = false;

    readonly isRootMenu = true;
    readonly cssAnimationStatus: WritableSignal<RdxNavigationMenuAnimationStatus | null> = signal(null);

    // exposed state as functions for the token
    value = () => this.#value();
    previousValue = () => this.#previousValue();
    rootNavigationMenu = () => this.#rootNavigationMenu();
    indicatorTrack = () => this.#indicatorTrack();
    viewport = () => this.#viewport();
    viewportContent = () => this.#viewportContent();

    // exposed pointer state
    setTriggerPointerState = (isOver: boolean) => this.#isPointerOverTrigger.set(isOver);
    setContentPointerState = (isOver: boolean) => this.#isPointerOverContent.set(isOver);
    isPointerInSystem = () => this.#isPointerOverContent() || this.#isPointerOverTrigger();

    // exposed  animation state
    getCssAnimation = () => this.cssAnimation;
    getCssOpeningAnimation = () => this.cssOpeningAnimation;
    getCssClosingAnimation = () => this.cssClosingAnimation;

    constructor() {
        effect(() => {
            const value = this.#value();
            if (value) {
                this.window.clearTimeout(this.skipDelayTimerRef);
                if (this.skipDelayDuration > 0) {
                    this.#isOpenDelayed.set(false);
                }
            } else {
                // menu is closed, start skip delay timer
                this.window.clearTimeout(this.skipDelayTimerRef);
                this.skipDelayTimerRef = this.window.setTimeout(() => {
                    this.#isOpenDelayed.set(true);
                }, this.skipDelayDuration);
            }
        });

        this.actionSubject$
            .pipe(
                map((config) => {
                    // different delays for open vs close (better ux)
                    const duration = config.action === RdxNavigationMenuAction.OPEN ? this.delayDuration : 150;
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
        this.document.addEventListener('mouseleave', this.documentMouseLeaveHandler);
    }

    ngOnDestroy() {
        this.window.clearTimeout(this.openTimerRef);
        this.window.clearTimeout(this.closeTimerRef);
        this.window.clearTimeout(this.skipDelayTimerRef);
        this.window.clearTimeout(this.recentlyActivatedTimerRef);

        // clean up document event listener
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
        // skip opening if user explicitly dismissed this menu
        if (this.#userDismissedByClick() && itemValue === this.#previousValue()) {
            return;
        }

        this.window.clearTimeout(this.openTimerRef);
        this.window.clearTimeout(this.closeTimerRef);

        if (this.#isOpenDelayed()) {
            this.handleDelayedOpen(itemValue);
        } else {
            this.handleOpen(itemValue);
        }
    }

    onTriggerLeave() {
        this.window.clearTimeout(this.openTimerRef);
        this.startCloseTimer();
    }

    onContentEnter() {
        this.window.clearTimeout(this.closeTimerRef);
    }

    onContentLeave() {
        this.startCloseTimer();
    }

    handleClose() {
        this.actionSubject$.next({ action: RdxNavigationMenuAction.CLOSE });
    }

    onItemSelect(itemValue: string) {
        const wasOpen = this.#value() === itemValue;

        // if this item just opened and the click would close it,
        // ignore the click during the brief protection window
        if (this.recentlyActivatedItem() === itemValue && wasOpen) {
            return;
        }

        const newValue = wasOpen ? '' : itemValue;

        // if user is closing an open menu, mark as user-dismissed
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
        const previousValue = this.#value();

        if (value && value !== previousValue) {
            this.window.clearTimeout(this.recentlyActivatedTimerRef);

            this.recentlyActivatedItem.set(value);

            this.recentlyActivatedTimerRef = this.window.setTimeout(() => {
                this.recentlyActivatedItem.set(null);
            }, this.clickIgnoreDuration);
        }

        // store previous value before changing
        this.#previousValue.set(previousValue);
        this.#value.set(value);
    }

    private startCloseTimer() {
        this.window.clearTimeout(this.closeTimerRef);
        this.closeTimerRef = this.window.setTimeout(() => {
            // only close if not hovering over any part of the system
            if (!this.isPointerInSystem()) {
                this.setValue('');
            }
        }, 150);
    }

    private handleOpen(itemValue: string) {
        this.window.clearTimeout(this.closeTimerRef);
        this.setValue(itemValue);
    }

    private handleDelayedOpen(itemValue: string) {
        const isOpenItem = this.#value() === itemValue;
        if (isOpenItem) {
            // if the item is already open, clear close timer
            this.window.clearTimeout(this.closeTimerRef);
        } else {
            // otherwise, start the open timer
            this.openTimerRef = this.window.setTimeout(() => {
                this.window.clearTimeout(this.closeTimerRef);
                this.setValue(itemValue);
            }, this.delayDuration);
        }
    }
}
