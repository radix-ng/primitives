import { Component } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';

@Component({
    selector: 'app-form',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form [errors]="{ email: 'Email is already taken' }" rdxFormRoot>
            <div name="email" rdxFieldRoot>
                <label rdxFieldLabel>Email</label>
                <input name="email" type="email" rdxFieldControl />
                <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
            </div>
            <button type="submit">Submit</button>
        </form>
    `
})
export default class Page {}
