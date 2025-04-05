import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    OnDestroy,
    Renderer2,
    runInInjectionContext,
    signal,
    untracked
} from '@angular/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuIndicator]',
    host: {
        '[attr.data-state]': 'isVisible() ? "visible" : "hidden"',
        '[attr.data-orientation]': 'context.orientation',
        '[style.display]': 'isVisible() ? null : "none"',
        'aria-hidden': 'true'
    }
})
export class RdxNavigationMenuIndicatorDirective implements OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    /**
     * Used to keep the indicator rendered and available in the DOM, even when hidden.
     * Useful for animations.
     * @default false
     */
    readonly forceMount = input<BooleanInput, unknown>(undefined, { transform: booleanAttribute });

    /** @ignore */
    private readonly _position = signal<{ size: number; offset: number } | null>(null);
    /** @ignore */
    private readonly _activeTrigger = signal<HTMLElement | null>(null);
    /** @ignore */
    private readonly _resizeObserver = new ResizeObserver(() => this.updatePosition());

    readonly isVisible = computed(() => Boolean(this.context.value() || this.forceMount()));

    constructor() {
        // set up effect for tracking active trigger and position
        effect(() => {
            // this effect runs when the current value changes
            const value = this.context.value();

            untracked(() => {
                if (value && isRootNavigationMenu(this.context)) {
                    this.findAndSetActiveTrigger();
                }
            });
        });

        // initialize observers for position tracking
        runInInjectionContext(this.context as any, () => {
            if (isRootNavigationMenu(this.context) && this.context.indicatorTrack) {
                const track = this.context.indicatorTrack();
                if (track) {
                    // observe size changes on the track
                    this._resizeObserver.observe(track);
                }

                // initial position update if menu is open
                if (this.context.value()) {
                    setTimeout(() => this.findAndSetActiveTrigger(), 0);
                }
            }
        });
    }

    /** @ignore */
    ngOnDestroy() {
        this._resizeObserver.disconnect();
    }

    /** @ignore */
    private findAndSetActiveTrigger(): void {
        if (!isRootNavigationMenu(this.context) || !this.context.indicatorTrack) return;

        const track = this.context.indicatorTrack();
        if (!track) return;

        // find all triggers within the track
        const triggers = Array.from(track.querySelectorAll('[rdxNavigationMenuTrigger]')) as HTMLElement[];

        // find the active trigger based on the current menu value
        const activeTrigger = triggers.find((trigger) => {
            const item = trigger.closest('[rdxNavigationMenuItem]');
            if (!item) return false;

            const value = item.getAttribute('value');
            return value === this.context.value();
        });

        if (activeTrigger && activeTrigger !== this._activeTrigger()) {
            this._activeTrigger.set(activeTrigger);
            this.updatePosition();
        }
    }

    /** @ignore */
    private updatePosition(): void {
        const trigger = this._activeTrigger();
        if (!trigger) return;

        const isHorizontal = this.context.orientation === 'horizontal';

        // calculate new position
        const newPosition = {
            size: isHorizontal ? trigger.offsetWidth : trigger.offsetHeight,
            offset: isHorizontal ? trigger.offsetLeft : trigger.offsetTop
        };

        // only update if position has changed
        if (JSON.stringify(newPosition) !== JSON.stringify(this._position())) {
            this._position.set(newPosition);

            // apply position styles
            const styles = isHorizontal
                ? {
                      position: 'absolute',
                      left: '0',
                      width: `${newPosition.size}px`,
                      transform: `translateX(${newPosition.offset}px)`
                  }
                : {
                      position: 'absolute',
                      top: '0',
                      height: `${newPosition.size}px`,
                      transform: `translateY(${newPosition.offset}px)`
                  };

            Object.entries(styles).forEach(([key, value]) => {
                this.renderer.setStyle(this.elementRef.nativeElement, key, value);
            });
        }
    }
}
