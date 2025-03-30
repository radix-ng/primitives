import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    Renderer2,
    runInInjectionContext,
    signal,
    untracked
} from '@angular/core';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuIndicator]',
    standalone: true,
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

    @Input({ transform: booleanAttribute }) forceMount: BooleanInput;

    private readonly _position = signal<{ size: number; offset: number } | null>(null);
    private readonly _activeTrigger = signal<HTMLElement | null>(null);
    private readonly _resizeObserver = new ResizeObserver(() => this.updatePosition());

    // Indicator visibility computed property
    readonly isVisible = computed(() => Boolean(this.context.value() || this.forceMount));

    constructor() {
        // Set up effect for tracking active trigger and position
        effect(() => {
            // This effect runs when the current value changes
            const value = this.context.value();

            untracked(() => {
                if (value && isRootNavigationMenu(this.context)) {
                    this.findAndSetActiveTrigger();
                }
            });
        });

        // Initialize observers for position tracking
        runInInjectionContext(this.context as any, () => {
            if (isRootNavigationMenu(this.context) && this.context.indicatorTrack) {
                const track = this.context.indicatorTrack();
                if (track) {
                    // Observe size changes on the track
                    this._resizeObserver.observe(track);
                }

                // Initial position update if menu is open
                if (this.context.value()) {
                    setTimeout(() => this.findAndSetActiveTrigger(), 0);
                }
            }
        });
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();
    }

    private findAndSetActiveTrigger() {
        if (!isRootNavigationMenu(this.context) || !this.context.indicatorTrack) return;

        const track = this.context.indicatorTrack();
        if (!track) return;

        // Find all triggers within the track
        const triggers = Array.from(track.querySelectorAll('[rdxNavigationMenuTrigger]')) as HTMLElement[];

        // Find the active trigger based on the current menu value
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

    private updatePosition() {
        const trigger = this._activeTrigger();
        if (!trigger) return;

        const isHorizontal = this.context.orientation === 'horizontal';

        // Calculate new position
        const newPosition = {
            size: isHorizontal ? trigger.offsetWidth : trigger.offsetHeight,
            offset: isHorizontal ? trigger.offsetLeft : trigger.offsetTop
        };

        // Only update if position has changed
        if (JSON.stringify(newPosition) !== JSON.stringify(this._position())) {
            this._position.set(newPosition);

            // Apply position styles
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
