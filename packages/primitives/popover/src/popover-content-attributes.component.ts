import { Component, computed, forwardRef } from '@angular/core';
import { RdxPopoverContentAttributesToken } from './popover-content-attributes.token';
import { injectPopoverRoot } from './popover-root.inject';
import { RdxPopoverAnimationStatus, RdxPopoverState } from './popover.types';
import { isRdxPopoverDevMode } from './popover.utils';

@Component({
    selector: '[rdxPopoverContentAttributes]',
    standalone: true,
    template: `
        <ng-content />
    `,
    host: {
        '[attr.id]': 'name()',
        '[attr.data-state]': 'popoverRoot.state()',
        '[attr.data-side]': 'popoverRoot.popoverContentDirective().side()',
        '[style]': 'disableAnimation() ? {animation: "none !important"} : null',
        '(animationstart)': 'onAnimationStart($event)',
        '(animationend)': 'onAnimationEnd($event)'
    },
    providers: [
        {
            provide: RdxPopoverContentAttributesToken,
            useExisting: forwardRef(() => RdxPopoverContentAttributesComponent)
        }
    ]
})
export class RdxPopoverContentAttributesComponent {
    /** @ignore */
    protected readonly popoverRoot = injectPopoverRoot();

    /** @ignore */
    readonly name = computed(() => `rdx-popover-content-attributes-${this.popoverRoot.uniqueId()}`);

    readonly disableAnimation = computed(() => !this.canAnimate());

    /** @ignore */
    protected onAnimationStart(_: AnimationEvent) {
        isRdxPopoverDevMode() &&
            console.log(this.popoverRoot.uniqueId(), '[onAnimationStart]', this.popoverRoot.state());
        this.popoverRoot.cssAnimationStatus.set(
            this.popoverRoot.state() === RdxPopoverState.OPEN
                ? RdxPopoverAnimationStatus.OPEN_STARTED
                : RdxPopoverAnimationStatus.CLOSED_STARTED
        );
    }

    /** @ignore */
    protected onAnimationEnd(_: AnimationEvent) {
        isRdxPopoverDevMode() && console.log(this.popoverRoot.uniqueId(), '[onAnimationEnd]', this.popoverRoot.state());
        this.popoverRoot.cssAnimationStatus.set(
            this.popoverRoot.state() === RdxPopoverState.OPEN
                ? RdxPopoverAnimationStatus.OPEN_ENDED
                : RdxPopoverAnimationStatus.CLOSED_ENDED
        );
    }

    private canAnimate() {
        return (
            this.popoverRoot.cssAnimation() &&
            ((this.popoverRoot.cssOnShowAnimation() && this.popoverRoot.state() === RdxPopoverState.OPEN) ||
                (this.popoverRoot.cssOnCloseAnimation() && this.popoverRoot.state() === RdxPopoverState.CLOSED))
        );
    }
}
