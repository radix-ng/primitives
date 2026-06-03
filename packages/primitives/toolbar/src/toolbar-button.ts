import { injectToolbarGroupContext, injectToolbarRootContext } from './toolbar-context';
import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput } from '@radix-ng/primitives/core';

/**
 * A button within a toolbar.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarButton]',
    exportAs: 'rdxToolbarButton',
    hostDirectives: [RdxCompositeItem],
    host: {
        '[attr.type]': 'nativeButton() ? "button" : undefined',
        '[attr.role]': 'nativeButton() ? undefined : "button"',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-focusable]': 'focusableWhenDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'isDisabled() ? "true" : undefined',
        '[attr.disabled]': 'isDisabled() && !focusableWhenDisabled() ? "" : undefined',
        '(click)': 'onClick($event)'
    }
})
export class RdxToolbarButton {
    protected readonly rootContext = injectToolbarRootContext();
    private readonly groupContext = injectToolbarGroupContext(true);
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });

    /**
     * Whether the button is disabled.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the button stays focusable while disabled (so it remains discoverable for keyboard
     * and screen-reader users).
     *
     * @default true
     */
    readonly focusableWhenDisabled = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Whether the host is a native `<button>`. When `false`, adds `role="button"`.
     *
     * @default true
     */
    readonly nativeButton = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** @ignore Effective disabled state, combining the button, group and toolbar. */
    readonly isDisabled = computed(
        () => this.disabled() || (this.groupContext?.disabled() ?? false) || this.rootContext.disabled()
    );

    constructor() {
        effect(() => {
            this.compositeItem.setMetadata({
                disabled: this.isDisabled(),
                focusableWhenDisabled: this.focusableWhenDisabled()
            });
        });
    }

    /** @ignore */
    protected onClick(event: Event): void {
        if (this.isDisabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
