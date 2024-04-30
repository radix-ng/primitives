import { FocusableOption } from '@angular/cdk/a11y';
import {
    booleanAttribute,
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    numberAttribute,
    OnDestroy,
    OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { injectRovingFocusGroup } from './roving-focus-group.directive';

const RdxRovingFocusItemToken = new InjectionToken<RdxRovingFocusItemDirective>(
    'RdxRovingFocusItemToken'
);

export function injectRovingFocusItem(): RdxRovingFocusItemDirective {
    return inject(RdxRovingFocusItemToken);
}

@Directive({
    selector: '[rdxRovingFocusItem]',
    standalone: true,
    host: {
        '(onKeydown)': '_onKeydown($event)',
        '[attr.tabindex]': '_tabindex()'
    },
    providers: [{ provide: RdxRovingFocusItemToken, useExisting: RdxRovingFocusItemDirective }]
})
export class RdxRovingFocusItemDirective implements OnInit, OnDestroy, FocusableOption {
    /**
     * Access the group the roving focus item belongs to.
     */
    private readonly group = injectRovingFocusGroup();

    /**
     * Access the element reference of the roving focus item.
     */
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * Access the destroyRef
     */
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Access the change detector ref
     */
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /**
     * Define the order of the roving focus item in the group.
     */
    @Input({ transform: numberAttribute }) order = 0;

    /**
     * Define if the item is disabled.
     */
    @Input({ transform: booleanAttribute }) disabled = false;

    ngOnInit(): void {
        this.group.register(this);

        this.group.keyManager.change
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }

    ngOnDestroy(): void {
        this.group.unregister(this);
    }

    /**
     * Handle key events on the roving focus item.
     * @param event The key event.
     */
    _onKeydown(event: KeyboardEvent): void {
        this.group.onKeydown(event);
    }

    /**
     * Derive the tabindex of the roving focus item.
     */
    _tabindex(): number {
        return this.group.keyManager.activeItem === this ? 0 : -1;
    }

    /**
     * Focus the roving focus item.
     * @internal
     */
    focus(): void {
        this.elementRef?.nativeElement.focus();
    }
}
