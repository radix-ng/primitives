import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    InputSignalWithTransform
} from '@angular/core';

import { TABS_CONTEXT_TOKEN } from './tabs-context.service';

interface TabsTriggerProps {
    // When true, prevents the user from interacting with the tab.
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
}

@Directive({
    selector: '[TabsTrigger]',
    standalone: true,
    host: {
        type: 'button',
        role: 'tab',
        '[id]': 'triggerId',
        '[attr.aria-selected]': 'selected()',
        '[attr.aria-controls]': 'contentId()',
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[attr.data-state]': "selected() ? 'active' : 'inactive'",
        '(mousedown)': 'onMouseDown($event)',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxTabsTriggerDirective implements TabsTriggerProps {
    protected readonly tabsContext = inject(TABS_CONTEXT_TOKEN);

    // A unique value that associates the trigger with a content.
    readonly value = input.required<string>();

    // When true, prevents the user from interacting with the tab.
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    protected readonly contentId = computed(
        () => `${this.tabsContext.getBaseId()}-content-${this.value()}`
    );
    protected readonly triggerId = computed(
        () => `${this.tabsContext.getBaseId()}-trigger-${this.value}`
    );

    protected readonly selected = computed(() => this.tabsContext.value$() === this.value());

    protected onMouseDown(event: MouseEvent) {
        if (!this.disabled() && event.button === 0 && !event.ctrlKey) {
            this.tabsContext?.setValue(this.value());
        } else {
            // prevent focus to avoid accidental activation
            event.preventDefault();
        }
    }

    protected onKeyDown(event: KeyboardEvent) {
        if ([' ', 'Enter'].includes(event.key)) {
            this.tabsContext?.setValue(this.value());
        }
    }
}
