import { computed, Directive } from '@angular/core';
import { injectFieldRootContext } from './field-root';

export interface RdxFieldValidityState {
    readonly valid: boolean | null;
    readonly pending: boolean;
    readonly messages: readonly string[];
}

/**
 * Reads the field's displayed validity and messages in an Angular template.
 * Apply to an `ng-container` to expose the template reference without adding a DOM element.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldValidity]',
    exportAs: 'rdxFieldValidity'
})
export class RdxFieldValidity {
    private readonly field = injectFieldRootContext();

    /** Displayed validity, pending state and messages for custom presentation. */
    readonly state = computed<RdxFieldValidityState>(
        () => ({
            valid: this.field.validState(),
            pending: this.field.pendingState(),
            messages: this.field.messages()
        }),
        { debugName: 'RdxFieldValidity.state' }
    );

    /** Whether a native constraint or an Angular validation key is currently displayed. */
    readonly matchesError = this.field.matchesError;
}
