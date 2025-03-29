import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy, signal } from '@angular/core';
import { injectNavigationMenu, isNavigationMenuRoot } from './navigation-menu.token';

@Directive({
    selector: '[rdxNavigationMenuIndicator]',
    standalone: true,
    host: {
        '[attr.data-state]': 'isVisible ? "visible" : "hidden"',
        '[attr.data-orientation]': 'context.orientation',
        'aria-hidden': 'true'
    }
})
export class RdxNavigationMenuIndicatorDirective implements OnDestroy, AfterViewInit {
    protected readonly context = injectNavigationMenu();
    protected readonly elementRef = inject(ElementRef);

    /** Whether to force mount the indicator */
    @Input({ transform: coerceBooleanProperty }) forceMount: BooleanInput;

    /** Whether the indicator is visible (any menu item is active) */
    get isVisible(): boolean {
        return Boolean(this.context.value());
    }

    /** The position of the indicator */
    private position = signal<{ size: number; offset: number } | null>(null);

    /** The active trigger element */
    private activeTrigger = signal<HTMLElement | null>(null);

    /** ResizeObserver for tracking element resizing */
    private resizeObserver: ResizeObserver | null = null;

    constructor() {
        // Set up resize observers
        this.resizeObserver = new ResizeObserver(() => {
            this.updatePosition();
        });

        // Watch for value changes to update the indicator position
        // We would use an effect here in a real implementation
        // For simplicity, we'll update on a basic interval
        const interval = setInterval(() => {
            if (this.context.value()) {
                this.updateActiveTrigger();
                this.updatePosition();
            }
        }, 100);

        // Clean up on destroy
        this.destroy = () => {
            clearInterval(interval);
        };
    }

    ngAfterViewInit() {
        // Observe the indicator track if available - only on root menu
        if (isNavigationMenuRoot(this.context)) {
            const track = this.context.indicatorTrack();
            if (track) {
                this.resizeObserver?.observe(track);
            }
        }
    }

    private destroy: () => void = () => {};

    ngOnDestroy() {
        this.resizeObserver?.disconnect();
        this.destroy();
    }

    /**
     * Update the active trigger element
     */
    private updateActiveTrigger(): void {
        // We need to check if this is a root menu with an indicator track
        if (!isNavigationMenuRoot(this.context)) return;

        // Find the trigger element for the active item
        const indicatorTrack = this.context.indicatorTrack();
        if (indicatorTrack) {
            const triggerElements = Array.from(
                indicatorTrack.querySelectorAll('[rdxNavigationMenuTrigger]')
            ) as HTMLElement[];

            const activeTrigger = triggerElements.find((trigger) => {
                const item = trigger.closest('[rdxNavigationMenuItem]');
                if (item) {
                    const value = item.getAttribute('value') || '';
                    return value === this.context.value();
                }
                return false;
            });

            if (activeTrigger) {
                this.activeTrigger.set(activeTrigger);
            }
        }
    }

    /**
     * Update the indicator position
     */
    private updatePosition(): void {
        if (!this.activeTrigger()) return;

        const trigger = this.activeTrigger()!;
        const isHorizontal = this.context.orientation === 'horizontal';

        this.position.set({
            size: isHorizontal ? trigger.offsetWidth : trigger.offsetHeight,
            offset: isHorizontal ? trigger.offsetLeft : trigger.offsetTop
        });

        // Update the styles based on the position
        const position = this.position();
        if (position) {
            const el = this.elementRef.nativeElement;
            const styles = isHorizontal
                ? {
                      left: '0',
                      width: `${position.size}px`,
                      transform: `translateX(${position.offset}px)`
                  }
                : {
                      top: '0',
                      height: `${position.size}px`,
                      transform: `translateY(${position.offset}px)`
                  };

            Object.assign(el.style, {
                position: 'absolute',
                ...styles
            });
        }
    }
}
