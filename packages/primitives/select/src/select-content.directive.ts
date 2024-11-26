import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, ContentChildren, DestroyRef, Directive, inject, QueryList } from '@angular/core';
import { pairwise, startWith, Subject } from 'rxjs';
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
export class RdxSelectContentDirective implements AfterContentInit {
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly dir = inject(Directionality, { optional: true });

    readonly highlighted = new Subject<RdxSelectItemDirective>();

    keyManager: ActiveDescendantKeyManager<RdxSelectItemDirective>;

    @ContentChildren(RdxSelectItemDirective, { descendants: true })
    options: QueryList<RdxSelectItemDirective>;

    constructor() {
        this.highlighted.pipe(startWith(null), pairwise()).subscribe(([prev, item]) => {
            if (prev) {
                prev.highlighted = false;
            }

            if (item) {
                item.highlighted = true;
            }
        });
    }

    initKeyManager() {
        return new ActiveDescendantKeyManager<RdxSelectItemDirective>(this.options)
            .withTypeAhead()
            .withVerticalOrientation()
            .withHorizontalOrientation(this.dir?.value ?? 'ltr');
    }

    ngAfterContentInit(): void {
        this.keyManager = this.initKeyManager();
    }
}
