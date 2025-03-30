import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    Input,
    numberAttribute,
    OnDestroy,
    signal
} from '@angular/core';
import { provideNavigationMenuContext } from './navigation-menu.token';
import { generateId } from './utils';

@Directive({
    selector: '[rdxNavigationMenu]',
    standalone: true,
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

    // Delay timers
    private openTimerRef = 0;
    private closeTimerRef = 0;
    private skipDelayTimerRef = 0;
    readonly #isOpenDelayed = signal(true);

    // Inputs
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() dir: 'ltr' | 'rtl' = 'ltr';
    @Input({ transform: numberAttribute }) delayDuration = 200;
    @Input({ transform: numberAttribute }) skipDelayDuration = 300;
    @Input({ transform: booleanAttribute }) loop = false;

    // DI injection properties
    readonly isRootMenu = true;

    // Expose state as functions for the token
    value = () => this.#value();
    previousValue = () => this.#previousValue();
    rootNavigationMenu = () => this.#rootNavigationMenu();
    indicatorTrack = () => this.#indicatorTrack();
    viewport = () => this.#viewport();
    viewportContent = () => this.#viewportContent();

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
    }

    ngOnDestroy() {
        window.clearTimeout(this.openTimerRef);
        window.clearTimeout(this.closeTimerRef);
        window.clearTimeout(this.skipDelayTimerRef);
    }

    onIndicatorTrackChange(track: HTMLElement | null) {
        this.#indicatorTrack.set(track);
    }

    onViewportChange(viewport: HTMLElement | null) {
        this.#viewport.set(viewport);
    }

    onTriggerEnter(itemValue: string) {
        window.clearTimeout(this.openTimerRef);

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

    onItemSelect(itemValue: string) {
        const newValue = itemValue === this.#value() ? '' : itemValue;
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
        this.#previousValue.set(this.#value());
        this.#value.set(value);
    }

    private startCloseTimer() {
        window.clearTimeout(this.closeTimerRef);
        this.closeTimerRef = window.setTimeout(() => this.setValue(''), 150);
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
