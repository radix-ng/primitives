import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemCheckbox } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, inject, input, signal } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { getCheckedState, isIndeterminate } from './utils';

@Directive({
    selector: '[RdxMenuItemCheckbox]',
    hostDirectives: [
        {
            directive: CdkMenuItemCheckbox,
            outputs: ['cdkMenuItemTriggered: menuItemTriggered']
        }
    ],
    host: {
        role: 'menuitemcheckbox',
        '[attr.aria-checked]': 'isIndeterminate(checked()) ? "mixed" : checked()',
        '[attr.data-state]': 'getCheckedState(checked())',
        '[attr.data-highlighted]': "highlightedState() ? '' : undefined",

        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(pointermove)': 'onPointerMove($event)'
    }
})
export class RdxMenuItemCheckboxDirective {
    private readonly cdkMenuItemCheckbox = inject(CdkMenuItemCheckbox, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly checked = input<boolean | 'indeterminate'>(false);

    readonly onCheckedChange = outputFromObservable(this.cdkMenuItemCheckbox.triggered);

    protected readonly disabledState = computed(() => this.disabled);

    protected readonly highlightedState = computed(() => this.isFocused());

    private readonly isFocused = signal(false);

    private stateChanged = effect(() => {
        if (isIndeterminate(this.checked())) {
            this.cdkMenuItemCheckbox.checked = true;
        } else {
            this.cdkMenuItemCheckbox.checked = !this.checked();
        }

        this.cdkMenuItemCheckbox.disabled = this.disabled();
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

    protected readonly isIndeterminate = isIndeterminate;
    protected readonly getCheckedState = getCheckedState;
}
