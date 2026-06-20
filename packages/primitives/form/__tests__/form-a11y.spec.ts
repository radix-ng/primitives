import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsForm, RdxFormErrors } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        _importsForm,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldError
    ],
    template: `
        <form [errors]="errors()" rdxFormRoot>
            <fieldset rdxFieldsetRoot>
                <legend rdxFieldsetLegend>Account</legend>
                <div name="email" rdxFieldRoot>
                    <label rdxFieldLabel>Email</label>
                    <input name="email" type="email" rdxFieldControl />
                    <p #err="rdxFieldError" rdxFieldError>{{ err.messages().join(' ') }}</p>
                </div>
            </fieldset>
            <button type="submit">Create account</button>
        </form>
    `
})
class A11yHost {
    readonly errors = signal<RdxFormErrors | null>(null);
}

describe('RdxFormRoot accessibility', () => {
    let fixture: ComponentFixture<A11yHost>;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [A11yHost] });
        fixture = TestBed.createComponent(A11yHost);
        await settle();
    });

    it('has no axe violations with a server error showing', async () => {
        fixture.componentInstance.errors.set({ email: 'Email is already taken' });
        await settle();
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
    });
});
