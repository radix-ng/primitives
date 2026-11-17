import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { provideRdxButtonConfig, RdxButtonConfig } from '@radix-ng/primitives/button';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectToolbarGroupContext, injectToolbarRootContext } from './toolbar-context';

const buttonConfig = (): RdxButtonConfig => {
    const button = inject(RdxToolbarButton);
    return { disabled: button.isDisabled, focusableWhenDisabled: button.focusableWhenDisabled };
};

/**
 * A button within a toolbar.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarButton]',
    exportAs: 'rdxToolbarButton',
    hostDirectives: [{ directive: RdxCompositeItem, inputs: ['tabIndex'] }],
    providers: [provideRdxButtonConfig(buttonConfig)],
    host: {
        '[attr.type]': 'nativeButton() ? "button" : undefined',
        '[attr.role]': 'role() !== undefined ? role() : nativeButton() ? undefined : "button"',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-focusable]': 'focusableWhenDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'isDisabled() && (!nativeButton() || focusableWhenDisabled()) ? "true" : undefined',
        '[attr.disabled]': 'nativeButton() && isDisabled() && !focusableWhenDisabled() ? "" : undefined',
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

    /** The authored ARIA role. `null` removes the explicit role. */
    readonly role = input<string | null | undefined>(undefined);

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
