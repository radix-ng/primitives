import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { RdxHoverCardContentAttributesToken } from './hover-card-content-attributes.token';
import { injectHoverCardRoot } from './hover-card-root.inject';
import { RdxHoverCardAnimationStatus, RdxHoverCardState } from './hover-card.types';

@Component({
    selector: '[rdxHoverCardContentAttributes]',
    template: `
        <ng-content />
    `,
    host: {
        '[attr.role]': '"dialog"',
        '[attr.id]': 'name()',
        '[attr.data-state]': 'rootDirective.state()',
        '[attr.data-side]': 'rootDirective.contentDirective().side()',
        '[attr.data-align]': 'rootDirective.contentDirective().align()',
        '[style]': 'disableAnimation() ? {animation: "none !important"} : null',
        '(animationstart)': 'onAnimationStart($event)',
        '(animationend)': 'onAnimationEnd($event)'
    },
    providers: [
        {
            provide: RdxHoverCardContentAttributesToken,
            useExisting: forwardRef(() => RdxHoverCardContentAttributesComponent)
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RdxHoverCardContentAttributesComponent {
    /** @ignore */
    protected readonly rootDirective = injectHoverCardRoot();

    /** @ignore */
    readonly name = computed(() => `rdx-hover-card-content-attributes-${this.rootDirective.uniqueId()}`);

    /** @ignore */
    readonly disableAnimation = computed(() => !this.canAnimate());

    /** @ignore */
    protected onAnimationStart(_: AnimationEvent) {
        this.rootDirective.cssAnimationStatus.set(
            this.rootDirective.state() === RdxHoverCardState.OPEN
                ? RdxHoverCardAnimationStatus.OPEN_STARTED
                : RdxHoverCardAnimationStatus.CLOSED_STARTED
        );
    }

    /** @ignore */
    protected onAnimationEnd(_: AnimationEvent) {
        this.rootDirective.cssAnimationStatus.set(
            this.rootDirective.state() === RdxHoverCardState.OPEN
                ? RdxHoverCardAnimationStatus.OPEN_ENDED
                : RdxHoverCardAnimationStatus.CLOSED_ENDED
        );
    }

    /** @ignore */
    private canAnimate() {
        return (
            this.rootDirective.cssAnimation() &&
            ((this.rootDirective.cssOpeningAnimation() && this.rootDirective.state() === RdxHoverCardState.OPEN) ||
                (this.rootDirective.cssClosingAnimation() && this.rootDirective.state() === RdxHoverCardState.CLOSED))
        );
    }
}
