import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemCheckbox } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, inject, input, signal } from '@angular/core';
import { getCheckedState, isIndeterminate } from './utils';

@Directive({
    selector: '[MenuCheckboxItem]',
    standalone: true,
    hostDirectives: [CdkMenuItemCheckbox],
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

    readonly disabled = input<boolean, BooleanInput>(this.cdkMenuItemCheckbox.checked, { transform: booleanAttribute });
    readonly checked = input<boolean, BooleanInput>(this.cdkMenuItemCheckbox.disabled, { transform: booleanAttribute });

    protected readonly disabledState = computed(() => this.disabled);

    protected readonly highlightedState = computed(() => this.isFocused());

    private readonly isFocused = signal(false);

    private stateChanged = effect(() => {
        this.cdkMenuItemCheckbox.checked = this.checked();
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
