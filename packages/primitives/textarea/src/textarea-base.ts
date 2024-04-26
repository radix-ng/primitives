import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';

export class RdxTextareaBase {
    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    constructor(
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}
