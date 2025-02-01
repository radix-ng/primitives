import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemRadio } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, inject, input, signal } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { getCheckedState } from './utils';

@Directive({
    selector: '[RdxMenuItemRadio]',
    hostDirectives: [
        {
            directive: CdkMenuItemRadio,
            outputs: ['cdkMenuItemTriggered: menuItemTriggered']
        }
    ],
    host: {
        role: 'menuitemradio',
        '[attr.aria-checked]': 'checked()',
        '[attr.data-state]': 'getCheckedState(checked())',
        '[attr.data-highlighted]': "highlightedState() ? '' : undefined",

        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(pointermove)': 'onPointerMove($event)'
    }
})
export class RdxMenuItemRadioDirective {
    private readonly cdkMenuItemRadio = inject(CdkMenuItemRadio, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly checked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly onValueChange = outputFromObservable(this.cdkMenuItemRadio.triggered);

    protected readonly disabledState = computed(() => this.disabled());

    protected readonly highlightedState = computed(() => this.isFocused());

    private readonly isFocused = signal(false);

    constructor() {
        effect(() => {
            this.cdkMenuItemRadio.checked = this.checked();
            this.cdkMenuItemRadio.disabled = this.disabled();
        });
    }

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

    protected readonly getCheckedState = getCheckedState;
}
