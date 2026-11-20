import { computed, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectCheckboxGroupContext } from './checkbox-group';
import { injectCheckboxRootContext } from './checkbox-root';

/** The visible, focusable checkbox control. */
@Directive({
    selector: 'button[rdxCheckboxButton]',
    host: {
        type: 'button',
        role: 'checkbox',
        '[attr.id]': 'controlId()',
        '[attr.data-parent]': 'rootContext.parent() ? "" : undefined',
        '[attr.aria-checked]': 'rootContext.indeterminate() ? "mixed" : rootContext.checked()',
        '[attr.aria-controls]': 'ariaControls()',
        '[disabled]': 'rootContext.disabled()',
        '[attr.aria-required]': 'rootContext.required() || undefined',
        '[attr.aria-readonly]': 'rootContext.readonly() || undefined',
        '[attr.aria-invalid]': 'rootContext.displayValid() === false ? "true" : undefined',
        '[attr.data-checked]': 'rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-unchecked]': '!rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-indeterminate]': 'rootContext.indeterminate() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-invalid]': 'rootContext.displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'rootContext.displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'rootContext.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'rootContext.dirtyState() ? "" : undefined',
        '(click)': 'rootContext.activate($event)',
        '(blur)': 'rootContext.blur()',
        '(keydown.enter)': 'rootContext.onEnter($event)'
    }
})
export class RdxCheckboxButtonDirective {
    protected readonly rootContext = injectCheckboxRootContext();
    private readonly group = injectCheckboxGroupContext(true);

    private readonly elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    /** ID used by labels and the parent checkbox's `aria-controls`. */
    readonly id = input<string>();
    private readonly generatedId = injectId('rdx-checkbox-');
    protected readonly controlId = computed(() => this.id() || this.generatedId);

    /** A `parent` checkbox lists the ids of the children it controls. */
    protected readonly ariaControls = computed(() =>
        this.group && this.rootContext.parent() ? this.group.controlledIds() : undefined
    );

    constructor() {
        inject(DestroyRef).onDestroy(this.rootContext.registerButton(this.elementRef.nativeElement));
        effect((onCleanup) => {
            const value = this.rootContext.itemValue();
            if (this.group && !this.rootContext.parent() && value !== undefined) {
                onCleanup(this.group.registerControl(value, this.controlId()));
            }
        });
    }
}
