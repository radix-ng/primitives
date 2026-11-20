import { afterNextRender, computed, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
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
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-labelledby]': 'labelledBy()',
        '[attr.aria-describedby]': 'rootContext.describedBy(ariaDescribedBy())',
        '[disabled]': 'rootContext.disabled()',
        '[attr.aria-required]': 'rootContext.required() || undefined',
        '[attr.aria-readonly]': 'rootContext.readonly() || undefined',
        '[attr.aria-invalid]': '!rootContext.disabled() && rootContext.displayValid() === false ? "true" : undefined',
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
        '[attr.data-filled]': 'rootContext.filledState() ? "" : undefined',
        '[attr.data-focused]': 'rootContext.focusedState() ? "" : undefined',
        '(focus)': 'rootContext.onButtonFocus()',
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
    /** Explicit accessible name. */
    readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
    /** Override the label supplied by Field or Field.Item. */
    readonly ariaLabelledBy = input<string>(undefined, { alias: 'aria-labelledby' });
    /** Additional description IDs, followed by the Field and Field.Item descriptions and errors. */
    readonly ariaDescribedBy = input<string>(undefined, { alias: 'aria-describedby' });

    protected readonly labelledBy = computed(
        () => this.ariaLabelledBy() ?? (this.ariaLabel()?.trim() ? undefined : this.rootContext.labelId())
    );
    private readonly generatedId = injectId('rdx-checkbox-');
    protected readonly controlId = computed(() => this.id() || this.generatedId);

    /** A `parent` checkbox lists the ids of the children it controls. */
    protected readonly ariaControls = computed(() =>
        this.group && this.rootContext.parent() ? this.group.controlledIds() : undefined
    );

    constructor() {
        const button = this.elementRef.nativeElement;
        inject(DestroyRef).onDestroy(this.rootContext.registerButton(button));
        const field = this.rootContext.labelField;
        if (field) {
            effect(() => field.setControlId(this.controlId()));
            afterNextRender(() => {
                const owner = button.getRootNode() as Document | ShadowRoot;
                if (owner.activeElement === button) this.rootContext.onButtonFocus();
            });
        }
        effect((onCleanup) => {
            const value = this.rootContext.itemValue();
            if (this.group && !this.rootContext.parent() && value !== undefined) {
                onCleanup(this.group.registerControl(value, this.controlId()));
            }
        });
    }
}
