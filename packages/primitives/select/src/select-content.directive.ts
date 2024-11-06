import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ContentChildren, DestroyRef, Directive, inject, QueryList } from '@angular/core';
import { RdxSelectItemDirective } from './select-item.directive';

@Directive({
    selector: '[rdxSelectContent]',
    standalone: true,
    exportAs: 'rdxSelectContent',
    host: {
        '[attr.data-state]': 'true',
        '[attr.data-side]': 'true',
        '[attr.data-align]': 'true'
    }
})
export class RdxSelectContentDirective {
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly dir = inject(Directionality, { optional: true });

    @ContentChildren(RdxSelectItemDirective, { descendants: true })
    options: QueryList<RdxSelectItemDirective>;

    initKeyManager() {
        return new ActiveDescendantKeyManager<RdxSelectItemDirective>(this.options)
            .withTypeAhead()
            .withVerticalOrientation()
            .withHorizontalOrientation(this.dir?.value ?? 'ltr');
    }
}
