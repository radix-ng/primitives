import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';

/** An interface which allows a control to work inside a `FormField`. */
export abstract class RdxFormFieldControl<T> {
    /** The value of the control. */
    value: T | null | undefined;

    /**
     * Stream that emits whenever the state of the control changes such that the parent `MсFormField`
     * needs to run change detection.
     */
    readonly stateChanges: Observable<void> | undefined;

    /** The element ID for this control. */
    readonly id: string | undefined;

    /** The placeholder for this control. */
    readonly placeholder: string | undefined;

    /** Gets the NgControl for this control. */
    readonly ngControl: NgControl | null | undefined;

    /** Whether the control is focused. */
    readonly focused: boolean | undefined;

    /** Whether the control is empty. */
    readonly empty: boolean | undefined;

    /** Whether the control is required. */
    readonly required: boolean | undefined;

    /** Whether the control is disabled. */
    readonly disabled: boolean | undefined;

    /**
     * An optional name for the control type that can be used to distinguish `form-field` elements
     * based on their control type. The form field will add a class,
     * `form-field-type-{{controlType}}` to its root element.
     */
    readonly controlType?: string;

    /** Handles a click on the control's container. */
    abstract onContainerClick(event: MouseEvent): void;

    abstract focus(): void;
}
