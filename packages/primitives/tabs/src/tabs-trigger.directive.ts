import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input, InputSignalWithTransform } from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { RDX_TABS_ROOT_TOKEN } from './tabs-root.directive';
import { makeContentId, makeTriggerId } from './utils';

interface TabsTriggerProps {
    // When true, prevents the user from interacting with the tab.
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
}

@Directive({
    selector: '[rdxTabsTrigger]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxRovingFocusItemDirective,
            inputs: ['focusable', 'active', 'allowShiftKey']
        }
    ],

    host: {
        type: 'button',
        role: 'tab',
        '[id]': 'triggerId()',
        '[attr.aria-selected]': 'isSelected()',
        '[attr.aria-controls]': 'contentId()',
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[disabled]': 'disabled()',
        '[attr.data-state]': "isSelected() ? 'active' : 'inactive'",
        '[attr.data-orientation]': 'tabsContext.orientation()',
        '(mousedown)': 'onMouseDown($event)',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'onFocus()'
    }
})
export class RdxTabsTriggerDirective implements TabsTriggerProps {
    protected readonly tabsContext = inject(RDX_TABS_ROOT_TOKEN);

    // A unique value that associates the trigger with a content.
    readonly value = input.required<string>();

    // When true, prevents the user from interacting with the tab.
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    protected readonly contentId = computed(() => makeContentId(this.tabsContext.getBaseId(), this.value()));
    protected readonly triggerId = computed(() => makeTriggerId(this.tabsContext.getBaseId(), this.value()));

    protected readonly isSelected = computed(() => this.tabsContext.value() === this.value());

    protected onMouseDown(event: MouseEvent) {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!this.disabled() && event.button === 0 && !event.ctrlKey) {
            this.tabsContext?.select(this.value());
        } else {
            // prevent focus to avoid accidental activation
            event.preventDefault();
        }
    }

    protected onKeyDown(event: KeyboardEvent) {
        if ([' ', 'Enter'].includes(event.key)) {
            this.tabsContext?.select(this.value());
        }
    }

    protected onFocus() {
        if (!this.isSelected() && !this.disabled()) {
            this.tabsContext?.select(this.value());
        }
    }
}
