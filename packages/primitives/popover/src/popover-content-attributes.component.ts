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
    styles: `
        :host {
            &.rdx-animated-content {
                &:is(.rdx-animated-content-open, .rdx-animated-content-close) {
                    animation-duration: 400ms;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                    will-change: transform, opacity;
                }

                &.rdx-animated-content-open {
                    &[data-state='open'][data-side='top'] {
                        animation-name: rdxSlideDownAndFade;
                    }

                    &[data-state='open'][data-side='right'] {
                        animation-name: rdxSlideLeftAndFade;
                    }

                    &[data-state='open'][data-side='bottom'] {
                        animation-name: rdxSlideUpAndFade;
                    }

                    &[data-state='open'][data-side='left'] {
                        animation-name: rdxSlideRightAndFade;
                    }
                }

                &.rdx-animated-content-close {
                    &[data-state='closed'][data-side='top'] {
                        animation-name: rdxSlideDownAndFadeReverse;
                    }

                    &[data-state='closed'][data-side='right'] {
                        animation-name: rdxSlideLeftAndFadeReverse;
                    }

                    &[data-state='closed'][data-side='bottom'] {
                        animation-name: rdxSlideUpAndFadeReverse;
                    }

                    &[data-state='closed'][data-side='left'] {
                        animation-name: rdxSlideRightAndFadeReverse;
                    }
                }
            }
        }

        /* Open animations */

        @keyframes rdxSlideUpAndFade {
            from {
                opacity: 0;
                transform: translateY(2px);
                /*transition:left 1s linear;*/
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes rdxSlideRightAndFade {
            from {
                opacity: 0;
                transform: translateX(-2px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes rdxSlideDownAndFade {
            from {
                opacity: 0;
                transform: translateY(-2px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes rdxSlideLeftAndFade {
            from {
                opacity: 0;
                transform: translateX(2px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        /* Close animations */

        @keyframes rdxSlideUpAndFadeReverse {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(2px);
            }
        }

        @keyframes rdxSlideRightAndFadeReverse {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-2px);
            }
        }

        @keyframes rdxSlideDownAndFadeReverse {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-2px);
            }
        }

        @keyframes rdxSlideLeftAndFadeReverse {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(2px);
            }
        }
    `,
    host: {
        '[attr.id]': 'name()',
        '[attr.data-state]': 'popoverRoot.state()',
        '[attr.data-side]': 'popoverRoot.popoverContentDirective().side()',
        '[class.rdx-animated-content]': 'popoverRoot.cssAnimation() === true',
        '[class.rdx-animated-content-open]': 'popoverRoot.cssAnimation() === true && popoverRoot.cssOnShowAnimation()',
        '[class.rdx-animated-content-close]':
            'popoverRoot.cssAnimation() === true && popoverRoot.cssOnCloseAnimation()',
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
}
