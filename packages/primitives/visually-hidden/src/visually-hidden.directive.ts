import { Directive, input, linkedSignal } from '@angular/core';

export type VisuallyHidden = 'focusable' | 'fully-hidden';

/**
 *
 * <span rdxVisuallyHidden [feature]="'fully-hidden'">
 *   <ng-content />
 * </span>
 *
 * <button (click)="directiveInstance.setFeature('focusable')">Make Focusable</button>
 * <button (click)="directiveInstance.setFeature('fully-hidden')">Hide</button>
 */
@Directive({
    selector: '[rdxVisuallyHidden]',
    host: {
        '[attr.tabindex]': 'computedFeature() === "fully-hidden" ? "-1" : undefined',
        '[attr.aria-hidden]': 'computedFeature() === "focusable" ? "true" : undefined',
        '[attr.data-hidden]': 'computedFeature() === "fully-hidden" ? "" : undefined',
        '[hidden]': 'computedFeature() === "fully-hidden" ? true : undefined',
        '[style]': `{
            position: 'absolute',
            border: 0,
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
            wordWrap: 'normal',
            top: '-1px',
            left: '-1px'
        }`,
        '[style.display]': 'feature() === "focusable" ? "inline-block" : "none"'
    }
})
export class RdxVisuallyHiddenDirective {
    readonly feature = input<VisuallyHidden>('focusable');

    protected readonly computedFeature = linkedSignal(this.feature);

    setFeature(feature: VisuallyHidden) {
        this.computedFeature.set(feature);
    }
}
