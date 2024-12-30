import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { RdxTooltipContentAttributesToken } from './tooltip-content-attributes.token';
import { injectTooltipRoot } from './tooltip-root.inject';
import { RdxTooltipAnimationStatus, RdxTooltipState } from './tooltip.types';

@Component({
    selector: '[rdxTooltipContentAttributes]',
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
        '(animationend)': 'onAnimationEnd($event)',
        '(pointerenter)': 'pointerenter()',
        '(pointerleave)': 'pointerleave()',
        '(focus)': 'focus()',
        '(blur)': 'blur()'
    },
    providers: [
        {
            provide: RdxTooltipContentAttributesToken,
            useExisting: forwardRef(() => RdxTooltipContentAttributesComponent)
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RdxTooltipContentAttributesComponent {
    /** @ignore */
    protected readonly rootDirective = injectTooltipRoot();

    /** @ignore */
    readonly name = computed(() => `rdx-tooltip-content-attributes-${this.rootDirective.uniqueId()}`);

    /** @ignore */
    readonly disableAnimation = computed(() => !this.canAnimate());

    /** @ignore */
    protected onAnimationStart(_: AnimationEvent) {
        this.rootDirective.cssAnimationStatus.set(
            this.rootDirective.state() === RdxTooltipState.OPEN
                ? RdxTooltipAnimationStatus.OPEN_STARTED
                : RdxTooltipAnimationStatus.CLOSED_STARTED
        );
    }

    /** @ignore */
    protected onAnimationEnd(_: AnimationEvent) {
        this.rootDirective.cssAnimationStatus.set(
            this.rootDirective.state() === RdxTooltipState.OPEN
                ? RdxTooltipAnimationStatus.OPEN_ENDED
                : RdxTooltipAnimationStatus.CLOSED_ENDED
        );
    }

    /** @ignore */
    protected pointerenter(): void {
        this.rootDirective.handleOpen();
    }

    /** @ignore */
    protected pointerleave(): void {
        this.rootDirective.handleClose();
    }

    /** @ignore */
    protected focus(): void {
        this.rootDirective.handleOpen();
    }

    /** @ignore */
    protected blur(): void {
        this.rootDirective.handleClose();
    }

    /** @ignore */
    private canAnimate() {
        return (
            this.rootDirective.cssAnimation() &&
            ((this.rootDirective.cssOpeningAnimation() && this.rootDirective.state() === RdxTooltipState.OPEN) ||
                (this.rootDirective.cssClosingAnimation() && this.rootDirective.state() === RdxTooltipState.CLOSED))
        );
    }
}
