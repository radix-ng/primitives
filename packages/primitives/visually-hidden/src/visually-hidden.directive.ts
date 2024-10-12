import { Directive, input } from '@angular/core';

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
    standalone: true,
    host: {
        '[attr.aria-hidden]': 'feature() === "focusable" ? "true" : null',
        '[hidden]': 'feature() === "fully-hidden" ? true : null',
        '[attr.tabindex]': 'feature() === "fully-hidden" ? "-1" : null',
        '[style.position]': '"absolute"',
        '[style.border]': '"0"',
        '[style.width]': '"1px"',
        '[style.display]': 'feature() === "focusable" ? "inline-block" : "none"',
        '[style.height]': '"1px"',
        '[style.padding]': '"0"',
        '[style.margin]': '"-1px"',
        '[style.overflow]': '"hidden"',
        '[style.clip]': '"rect(0, 0, 0, 0)"',
        '[style.white-space]': '"nowrap"',
        '[style.word-wrap]': '"normal"'
    }
})
export class RdxVisuallyHiddenDirective {
    readonly feature = input<'focusable' | 'fully-hidden'>('focusable');
}
