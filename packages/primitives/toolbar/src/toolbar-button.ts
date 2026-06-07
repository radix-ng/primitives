import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { injectToolbarGroupContext, injectToolbarRootContext } from './toolbar-context';

/**
 * A button within a toolbar.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarButton]',
    exportAs: 'rdxToolbarButton',
    hostDirectives: [RdxRovingFocusItemDirective],
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
    protected readonly rootContext = injectToolbarRootContext()!;
    private readonly groupContext = injectToolbarGroupContext(true);
    private readonly rovingItem = inject(RdxRovingFocusItemDirective);

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
        // A disabled-but-focusable item stays in the roving sequence; otherwise it is removed.
        effect(() => this.rovingItem.setFocusable(!this.isDisabled() || this.focusableWhenDisabled()));
    }

    /** @ignore */
    protected onClick(event: Event): void {
        if (this.isDisabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
