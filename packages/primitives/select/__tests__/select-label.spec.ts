import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldItem, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <div [(open)]="open" [id]="rootId()" [disabled]="disabled()" rdxSelectRoot>
            @if (showLabel()) {
                <div id="ignored-label-id" rdxSelectLabel>
                    Country
                    <button (click)="help.set(help() + 1)" type="button">Help</button>
                </div>
            }
            <button [id]="triggerId()" [aria-labelledby]="labelledBy()" rdxSelectTrigger>Choose</button>
        </div>
    `
})
class Host {
    readonly rootId = signal<string | undefined>('country');
    readonly triggerId = signal<string | undefined>(undefined);
    readonly labelledBy = signal<string | undefined>(undefined);
    readonly open = signal(false);
    readonly disabled = signal(false);
    readonly showLabel = signal(true);
    readonly help = signal(0);
}

@Component({
    imports: [_importsSelect, RdxFieldRoot, RdxFieldLabel],
    template: `
        <div [invalid]="invalid()" validationMode="always" rdxFieldRoot>
            <label id="field-label" rdxFieldLabel>Field country</label>
            <ng-container id="native-country" rdxSelectRoot>
                @if (local()) {
                    <label rdxSelectLabel>Local country</label>
                }
                <button [id]="triggerId()" rdxSelectTrigger>Choose</button>
            </ng-container>
        </div>
        <button id="same-host-one" rdxSelectRoot rdxSelectTrigger>One</button>
        <button id="same-host-two" rdxSelectTrigger rdxSelectRoot>Two</button>
    `
})
class FieldHost {
    readonly invalid = signal(false);
    readonly local = signal(true);
    readonly triggerId = signal<string | undefined>('custom-trigger');
}

@Component({
    imports: [_importsSelect, RdxFieldRoot, RdxFieldItem, RdxFieldLabel],
    template: `
        <div rdxFieldRoot>
            @for (name of ['Shipping', 'Billing']; track name) {
                <div rdxFieldItem>
                    <label rdxFieldLabel>{{ name }}</label>
                    <ng-container rdxSelectRoot><button rdxSelectTrigger>Choose</button></ng-container>
                </div>
            }
        </div>
    `
})
class FieldItemsHost {}

describe('Select.Label and root id', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    const trigger = (): HTMLButtonElement => fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    const label = (): HTMLElement => fixture.nativeElement.querySelector('[rdxSelectLabel]');
    async function settle() {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    });

    it('forwards the root id once and derives the label id from it', () => {
        expect(trigger().id).toBe('country');
        expect(label().id).toBe('country-label');
        expect(trigger().getAttribute('aria-labelledby')).toBe(label().id);
        expect(fixture.nativeElement.querySelector('[rdxSelectRoot]').hasAttribute('id')).toBe(false);
    });

    it('focuses the trigger without opening the popup', async () => {
        label().click();
        await settle();
        expect(document.activeElement).toBe(trigger());
        expect(host.open()).toBe(false);
    });

    it('leaves nested interactive elements in control of their own clicks', () => {
        const help: HTMLButtonElement = label().querySelector('button')!;
        help.focus();
        help.click();
        expect(host.help()).toBe(1);
        expect(document.activeElement).toBe(help);
        expect(host.open()).toBe(false);
    });

    it('respects a prevented interaction and a disabled trigger', async () => {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        event.preventDefault();
        label().dispatchEvent(event);
        expect(document.activeElement).not.toBe(trigger());
        host.disabled.set(true);
        await settle();
        label().click();
        expect(document.activeElement).not.toBe(trigger());
    });

    it('updates labels when root id changes and respects a trigger id override', async () => {
        host.rootId.set('updated-country');
        await settle();
        expect(trigger().id).toBe('updated-country');
        expect(label().id).toBe('updated-country-label');
        expect(trigger().getAttribute('aria-labelledby')).toBe(label().id);
        host.triggerId.set('custom-country');
        await settle();
        expect(trigger().id).toBe('custom-country');
        label().click();
        expect(document.activeElement).toBe(trigger());
        host.triggerId.set(undefined);
        host.rootId.set(undefined);
        await settle();
        expect(trigger().id).toMatch(/^rdx-select-/);
        expect(label().id).toBe(`${trigger().id}-label`);
        expect(trigger().getAttribute('aria-labelledby')).toBe(label().id);
    });

    it('removes a stale label reference and preserves explicit accessible-name references', async () => {
        host.labelledBy.set('external-label');
        await settle();
        expect(trigger().getAttribute('aria-labelledby')).toBe('external-label');
        host.labelledBy.set(undefined);
        host.showLabel.set(false);
        await settle();
        expect(trigger().hasAttribute('aria-labelledby')).toBe(false);
    });
});

describe('Select labels with Field and native hosts', () => {
    it('keeps label associations scoped to the owning Field.Item', async () => {
        TestBed.configureTestingModule({ imports: [FieldItemsHost] });
        const fixture = TestBed.createComponent(FieldItemsHost);
        fixture.detectChanges();
        await fixture.whenStable();
        const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxFieldItem]'));
        for (const item of items) {
            const label = item.querySelector('label');
            const button = item.querySelector('button');
            expect(button?.getAttribute('aria-labelledby')).toBe(label?.id);
            expect(label?.htmlFor).toBe(button?.id);
        }
        expect(items[0].querySelector('button')?.getAttribute('aria-labelledby')).not.toBe(
            items[1].querySelector('button')?.getAttribute('aria-labelledby')
        );
    });
    it('supports container roots, native labels, reactive ids and same-host composition', async () => {
        TestBed.configureTestingModule({ imports: [FieldHost] });
        const fixture = TestBed.createComponent(FieldHost);
        const settle = async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        };
        await settle();
        const fieldLabel: HTMLLabelElement = fixture.nativeElement.querySelector('[rdxFieldLabel]');
        const local: HTMLLabelElement = fixture.nativeElement.querySelector('[rdxSelectLabel]');
        const button: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxFieldRoot] button');
        expect(local.htmlFor).toBe(button.id);
        expect(fieldLabel.htmlFor).toBe(button.id);
        expect(button.getAttribute('aria-labelledby')).toBe(local.id);
        fixture.componentInstance.invalid.set(true);
        await settle();
        expect(local.hasAttribute('data-invalid')).toBe(true);
        fixture.componentInstance.local.set(false);
        fixture.componentInstance.triggerId.set(undefined);
        await settle();
        expect(button.id).toBe('native-country');
        expect(fieldLabel.htmlFor).toBe(button.id);
        expect(button.getAttribute('aria-labelledby')).toBe('field-label');
        for (const id of ['same-host-one', 'same-host-two']) {
            const matching = fixture.nativeElement.querySelectorAll(`[id="${id}"]`);
            expect(matching).toHaveLength(1);
            expect(matching[0].getAttribute('role')).toBe('combobox');
        }
    });
});
