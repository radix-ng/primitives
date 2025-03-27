import { Directive, input, linkedSignal } from '@angular/core';

/**
 *
 * <span rdxVisuallyHidden [feature]="'fully-hidden'">
 *   <ng-content></ng-content>
 * </span>
 *
 * <button (click)="directiveInstance.feature.set('focusable')">Make Focusable</button>
 * <button (click)="directiveInstance.feature.set('fully-hidden')">Hide</button>
 */
@Directive({
    selector: '[rdxVisuallyHidden]',
    host: {
        '[attr.aria-hidden]': 'feature() === "focusable" ? "true" : undefined',
        '[hidden]': 'feature() === "fully-hidden" ? true : undefined',
        '[attr.tabindex]': 'feature() === "fully-hidden" ? "-1" : undefined',
        '[style.position]': '"absolute"',
        '[style.border]': '"0"',
        '[style.display]': 'feature() === "focusable" ? "inline-block" : "none"',
        '[style.width]': '"1px"',
        '[style.height]': '"1px"',
        '[style.padding]': '"0"',
        '[style.margin]': '"-1px"',
        '[style.overflow]': '"hidden"',
        '[style.clip]': '"rect(0, 0, 0, 0)"',
        '[style.clipPath]': '"inset(50%)"',
        '[style.white-space]': '"nowrap"',
        '[style.word-wrap]': '"normal"'
    }
})
export class RdxVisuallyHiddenDirective {
    readonly feature = input<'focusable' | 'fully-hidden'>('focusable');

    protected readonly featureEffect = linkedSignal({
        source: this.feature,
        computation: (feature: 'focusable' | 'fully-hidden') => feature
    });

    updateFeature(feature: 'focusable' | 'fully-hidden') {
        this.featureEffect.set(feature);
    }
}
