import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { RdxSelectRoot } from '../index';
import { SelectTypedControl } from '../stories/select-typed-control';
import { SelectCountry, SelectTypedWrapper } from '../stories/select-typed-wrapper';

describe('Select application-owned typed wrapper', () => {
    let fixture: ComponentFixture<SelectTypedWrapper>;
    let host: SelectTypedWrapper;
    let controls: SelectTypedControl<SelectCountry, boolean>[];

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectTypedWrapper] });
        fixture = TestBed.createComponent(SelectTypedWrapper);
        host = fixture.componentInstance;
        await settle();
        controls = fixture.debugElement
            .queryAll(By.directive(SelectTypedControl))
            .map((node) => node.componentInstance);
    });

    it('rebinds the primitive DI token to the wrapper instead of creating a second root', () => {
        const node = fixture.debugElement.query(By.directive(SelectTypedControl));
        expect(node.injector.get(RdxSelectRoot)).toBe(controls[0]);
        expect(controls[0].triggerElement()).toBe(node.nativeElement.querySelector('[rdxSelectTrigger]'));
    });

    it('inherits Reactive Forms value, dirty, disabled and reset without a wrapper CVA', async () => {
        expect(controls[0].value()).toEqual(host.countries[0]);
        controls[0].setValue(host.countries[1], 'item-press');
        await settle();
        expect(host.reactiveCountry.value).toEqual(host.countries[1]);
        expect(host.reactiveCountry.dirty).toBe(true);

        host.reactiveCountry.disable();
        await settle();
        expect(controls[0].triggerElement()?.hasAttribute('disabled')).toBe(true);
        expect(controls[0].setValue(host.countries[2])).toBe(false);

        host.reactiveCountry.enable();
        host.reset();
        await settle();
        expect(controls[0].value()).toEqual(host.countries[0]);
        expect(host.reactiveCountry.pristine).toBe(true);
        const formElement = fixture.nativeElement.querySelector('form');
        expect(new FormData(formElement).get('reactiveCountry')).toBe('fr');
    });

    it('inherits Signal Forms binding, dirty state and reset', async () => {
        controls[1].setValue(host.countries[2], 'item-press');
        await settle();
        expect(host.profile().country).toEqual(host.countries[2]);
        expect(host.profileForm.country().dirty()).toBe(true);

        host.reset();
        await settle();
        expect(controls[1].value()).toEqual(host.countries[0]);
        expect(host.profileForm.country().dirty()).toBe(false);
    });

    it('preserves cancellable Base UI value events through the wrapper', async () => {
        const change = controls[0].onValueChange.subscribe((event) => event.eventDetails.cancel());
        expect(controls[0].setValue(host.countries[1], 'item-press')).toBe(false);
        await settle();
        expect(host.reactiveCountry.value).toEqual(host.countries[0]);
        expect(host.reactiveCountry.pristine).toBe(true);
        change.unsubscribe();
    });

    it('uses the same primitive for multiple selection and toggles object values', async () => {
        controls[2].setValue(host.countries[0]);
        controls[2].setValue(host.countries[2]);
        await settle();
        expect(host.selectedCountries()).toEqual([host.countries[0], host.countries[2]]);
        controls[2].setValue({ ...host.countries[0] });
        await settle();
        expect(host.selectedCountries()).toEqual([host.countries[2]]);
    });
});
