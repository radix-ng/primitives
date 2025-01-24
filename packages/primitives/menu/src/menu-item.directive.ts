import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, inject, input, signal } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[RdxMenuItem]',
    hostDirectives: [CdkMenuItem],
    host: {
        role: 'menuitem',
        tabindex: '-1',
        '[attr.data-orientation]': "'horizontal'",
        '[attr.data-state]': 'isOpenState()',
        '[attr.aria-disabled]': "disabledState() ? '' : undefined",
        '[attr.data-disabled]': "disabledState() ? '' : undefined",
        '[attr.data-highlighted]': "highlightedState() ? '' : undefined",

        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(pointermove)': 'onPointerMove($event)'
    }
})
export class RdxMenuItemDirective {
    private readonly cdkMenuItem = inject(CdkMenuItem, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly onSelect = outputFromObservable(this.cdkMenuItem.triggered);

    private readonly isFocused = signal(false);

    protected readonly disabledState = computed(() => this.disabled());

    protected readonly isOpenState = signal(false);

    protected readonly highlightedState = computed(() => this.isFocused());

    private stateChanged = effect(() => {
        this.cdkMenuItem.disabled = this.disabled();
        this.isOpenState.set(this.cdkMenuItem.isMenuOpen());
    });

    onFocus(): void {
        if (!this.disabled()) {
            this.isFocused.set(true);
        }
    }

    onBlur(): void {
        this.isFocused.set(false);
    }

    onPointerMove(event: PointerEvent) {
        if (event.defaultPrevented) return;

        if (!(event.pointerType === 'mouse')) return;

        if (!this.disabled()) {
            const item = event.currentTarget;
            (item as HTMLElement)?.focus({ preventScroll: true });
        }
    }
}
