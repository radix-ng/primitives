import { CdkTrapFocus } from '@angular/cdk/a11y';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, forwardRef, inject } from '@angular/core';
import { RdxPopoverContentAttributesToken } from './popover-content-attributes.token';
import { injectPopoverRoot } from './popover-root.inject';
import { RdxPopoverAnimationStatus, RdxPopoverState } from './popover.types';

@Component({
    selector: '[rdxPopoverContentAttributes]',
    template: `
        <ng-content />
    `,
    host: {
        '[attr.role]': '"dialog"',
        '[attr.id]': 'name()',
        '[attr.data-state]': 'popoverRoot.state()',
        '[attr.data-side]': 'popoverRoot.popoverContentDirective().side()',
        '[attr.data-align]': 'popoverRoot.popoverContentDirective().align()',
        '[style]': 'disableAnimation() ? {animation: "none !important"} : null',
        '(animationstart)': 'onAnimationStart($event)',
        '(animationend)': 'onAnimationEnd($event)'
    },
    hostDirectives: [
        CdkTrapFocus
    ],
    providers: [
        {
            provide: RdxPopoverContentAttributesToken,
            useExisting: forwardRef(() => RdxPopoverContentAttributesComponent)
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RdxPopoverContentAttributesComponent {
    /** @ignore */
    private readonly focusTrapDirective = inject(CdkTrapFocus, { self: true });

    /** @ignore */
    protected readonly popoverRoot = injectPopoverRoot();

    /** @ignore */
    readonly name = computed(() => `rdx-popover-content-attributes-${this.popoverRoot.uniqueId()}`);

    /** @ignore */
    readonly disableAnimation = computed(() => !this.canAnimate());

    constructor() {
        afterNextRender({
            write: () => this.focusTrapDirective.focusTrap.focusFirstTabbableElement()
        });
    }

    /** @ignore */
    protected onAnimationStart(_: AnimationEvent) {
        this.popoverRoot.cssAnimationStatus.set(
            this.popoverRoot.state() === RdxPopoverState.OPEN
                ? RdxPopoverAnimationStatus.OPEN_STARTED
                : RdxPopoverAnimationStatus.CLOSED_STARTED
        );
    }

    /** @ignore */
    protected onAnimationEnd(_: AnimationEvent) {
        this.popoverRoot.cssAnimationStatus.set(
            this.popoverRoot.state() === RdxPopoverState.OPEN
                ? RdxPopoverAnimationStatus.OPEN_ENDED
                : RdxPopoverAnimationStatus.CLOSED_ENDED
        );
    }

    /** @ignore */
    private canAnimate() {
        return (
            this.popoverRoot.cssAnimation() &&
            ((this.popoverRoot.cssOpeningAnimation() && this.popoverRoot.state() === RdxPopoverState.OPEN) ||
                (this.popoverRoot.cssClosingAnimation() && this.popoverRoot.state() === RdxPopoverState.CLOSED))
        );
    }
}
