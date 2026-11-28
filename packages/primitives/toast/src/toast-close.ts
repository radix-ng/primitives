import { booleanAttribute, computed, DestroyRef, Directive, inject, input } from '@angular/core';
import { provideRdxButtonConfig, RdxButtonDirective } from '@radix-ng/primitives/button';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxToastRootContext } from './toast-root';

/** Button that dismisses its toast. A click handler can cancel dismissal with `preventDefault()`. */
@Directive({
    selector: '[rdxToastClose]',
    exportAs: 'rdxToastClose',
    hostDirectives: [{ directive: RdxButtonDirective, inputs: ['type', 'role', 'tabIndex'] }],
    providers: [
        provideRdxButtonConfig(() => ({
            disabled: inject(RdxToastClose).disabled,
            focusableWhenDisabled: computed(() => false)
        }))
    ],
    host: {
        '[attr.data-type]': 'rootContext.toast().type',
        '(click)': 'onClick($event)'
    }
})
export class RdxToastClose {
    /** Whether the close button is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly rootContext = injectRdxToastRootContext();
    private readonly destroyRef = inject(DestroyRef);

    protected onClick(event: MouseEvent): void {
        if (this.disabled()) return;
        const { id } = this.rootContext.toast();

        // Angular runs directive host listeners before the template's click binding.
        queueMicrotask(() => {
            if (!event.defaultPrevented && !this.destroyRef.destroyed && this.rootContext.toast().id === id) {
                this.rootContext.close();
            }
        });
    }
}
