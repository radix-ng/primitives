import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { installFixture, serverErrors } from './contract';

installFixture();

@Component({
    selector: 'parity-field',
    imports: [RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot, RdxFieldsetRoot, RdxFormRoot],
    template: `
        <form (onFormSubmit)="submits.update(increment)" rdxFormRoot validationMode="onSubmit">
            <div rdxFieldRoot data-testid="email-field" name="email">
                <label rdxFieldLabel>Email</label>
                <input id="email" rdxFieldControl name="email" type="email" required />
                <p id="missing-email" rdxFieldError match="valueMissing">Enter an email.</p>
                <p id="malformed-email" rdxFieldError match="typeMismatch">Use a valid email.</p>
            </div>
            <div rdxFieldRoot data-testid="display-name-field" name="display-name">
                <label rdxFieldLabel>Display name</label>
                <input id="display-name" rdxFieldControl name="display-name" required />
            </div>
            <button type="submit">Submit profile</button>
            <output data-testid="submits">{{ submits() }}</output>
        </form>
        <fieldset [disabled]="disabled()" rdxFieldsetRoot>
            <fieldset rdxFieldsetRoot>
                <div rdxFieldRoot data-testid="inherited-field">
                    <label rdxFieldLabel>Nested fieldset input</label>
                    <input rdxFieldControl />
                </div>
            </fieldset>
        </fieldset>
        <button (click)="disabled.set(!disabled())" type="button">Toggle fieldset</button>
        <form [errors]="errors" rdxFormRoot>
            <div rdxFieldRoot data-testid="outer-field" name="outer">
                <label rdxFieldLabel>Outer</label>
                <input id="outer" rdxFieldControl name="outer" />
                <p id="outer-error" rdxFieldError>Outer field error</p>
                <div rdxFieldRoot data-testid="inner-field" name="inner">
                    <label rdxFieldLabel>Inner</label>
                    <input id="inner" rdxFieldControl name="inner" />
                    <p id="inner-error" rdxFieldError>Inner field error</p>
                </div>
            </div>
        </form>
    `
})
class FieldFixture {
    protected readonly submits = signal(0);
    protected readonly increment = (count: number) => count + 1;
    protected readonly disabled = signal(true);
    protected readonly errors = serverErrors;
}

void bootstrapApplication(FieldFixture, { providers: [provideZonelessChangeDetection()] });
