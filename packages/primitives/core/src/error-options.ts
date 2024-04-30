import { Injectable } from '@angular/core';
import { FormGroupDirective, NgForm, UntypedFormControl } from '@angular/forms';

/** Provider that defines how form controls behave in regard to displaying error messages. */
@Injectable({ providedIn: 'root' })
export class ErrorStateMatcher {
    isErrorState(
        control: UntypedFormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        return !!(control && control.invalid && (control.touched || (form && form.submitted)));
    }
}
