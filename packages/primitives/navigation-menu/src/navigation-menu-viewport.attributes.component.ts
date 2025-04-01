import { Component, computed } from '@angular/core';
import { injectNavigationMenu } from './navigation-menu.token';
import { RdxNavigationMenuAnimationStatus } from './navigation-menu.types';

@Component({
    selector: '[rdxNavigationMenuViewportAttributes]',
    template: `
        <ng-content />
    `,
    host: {
        '[attr.data-state]': 'getOpenState()',
        '[attr.data-orientation]': 'context.orientation',
        '[style]': 'disableAnimation() ? {animation: "none !important"} : null',
        '(animationstart)': 'onAnimationStart($event)',
        '(animationend)': 'onAnimationEnd($event)'
    },
    standalone: true
})
export class RdxNavigationMenuViewportAttributesComponent {
    private readonly context = injectNavigationMenu();

    getOpenState(): 'open' | 'closed' {
        return this.context.value() ? 'open' : 'closed';
    }

    disableAnimation = computed(() => !this.canAnimate());

    onAnimationStart(_: AnimationEvent) {
        if (this.context.cssAnimation) {
            this.context.cssAnimationStatus.set(
                this.getOpenState() === 'open'
                    ? RdxNavigationMenuAnimationStatus.OPEN_STARTED
                    : RdxNavigationMenuAnimationStatus.CLOSED_STARTED
            );
        }
    }

    onAnimationEnd(_: AnimationEvent) {
        if (this.context.cssAnimation) {
            this.context.cssAnimationStatus.set(
                this.getOpenState() === 'open'
                    ? RdxNavigationMenuAnimationStatus.OPEN_ENDED
                    : RdxNavigationMenuAnimationStatus.CLOSED_ENDED
            );
        }
    }

    private canAnimate() {
        const state = this.getOpenState();
        return (
            this.context.cssAnimation &&
            ((this.context.cssOpeningAnimation && state === 'open') ||
                (this.context.cssClosingAnimation && state === 'closed'))
        );
    }
}
