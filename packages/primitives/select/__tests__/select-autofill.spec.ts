import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AcceptableValue, RdxNativeInputRef } from '@radix-ng/primitives/core';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect, RdxSelectRoot, RdxSelectValueChangeEvent } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <form>
            <div
                [(value)]="value"
                [(open)]="open"
                [name]="name()"
                [autoComplete]="autoComplete()"
                [inputRef]="ref()"
                [required]="required()"
                [disabled]="disabled()"
                [readOnly]="readOnly()"
                [multiple]="multiple()"
                [itemToStringValue]="serialize()"
                [itemToStringLabel]="label()"
                (onValueChange)="changed($event)"
                rdxSelectRoot
            >
                <button rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                </button>
                <div *rdxSelectPortal rdxSelectPositioner>
                    <div rdxSelectBackdrop></div>
                    <div rdxSelectPopup>
                        <div rdxSelectList>
                            @for (option of options(); track $index) {
                                <div [value]="option.value" rdxSelectItem>
                                    @if (itemText()) {
                                        <span rdxSelectItemText>{{ option.label }}</span>
                                    } @else {
                                        {{ option.label }}
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
class Host {
    readonly value = signal<AcceptableValue | AcceptableValue[] | undefined>(null);
    readonly open = signal(false);
    readonly name = signal<string | undefined>('country');
    readonly autoComplete = signal<string | undefined>('country');
    readonly required = signal(false);
    readonly disabled = signal(false);
    readonly readOnly = signal(false);
    readonly multiple = signal(false);
    readonly itemText = signal(true);
    readonly ref = signal<RdxNativeInputRef | undefined>(undefined);
    readonly serialize = signal<((value: AcceptableValue) => string) | undefined>(undefined);
    readonly label = signal<((value: AcceptableValue) => string) | undefined>(undefined);
    readonly options = signal<{ value: AcceptableValue; label: string }[]>([
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' }
    ]);
    readonly events: RdxSelectValueChangeEvent[] = [];
    cancel = false;
    changed(event: RdxSelectValueChangeEvent) {
        this.events.push(event);
        if (this.cancel) event.eventDetails.cancel();
    }
}

@Component({
    imports: [_importsSelect, RdxFieldRoot, RdxFormRoot],
    template: `
        <form [errors]="{ country: 'Server error' }" (onClearErrors)="clears = clears + 1" rdxFormRoot>
            <div name="country" rdxFieldRoot>
                <div [defaultValue]="'US'" (onValueChange)="cancel() && $event.eventDetails.cancel()" rdxSelectRoot>
                    <button rdxSelectTrigger>Country</button>
                    <div *rdxSelectPortal rdxSelectPositioner>
                        <div rdxSelectPopup>
                            <div rdxSelectList><div value="CA" rdxSelectItem>Canada</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
class ServerErrorsHost {
    readonly cancel = signal(true);
    clears = 0;
}

describe('autofill with external form errors', () => {
    it('clears server errors only after an accepted selection', async () => {
        TestBed.configureTestingModule({ imports: [ServerErrorsHost] });
        const fixture = TestBed.createComponent(ServerErrorsHost);
        const settle = async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        };
        await settle();
        const root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
        const field = fixture.nativeElement.querySelector('[rdxFieldRoot]');
        const fill = async () => {
            const input = root.nativeInput()!;
            input.value = 'CA';
            input.dispatchEvent(new Event('change', { bubbles: true }));
            await Promise.resolve();
            await settle();
            await settle();
        };
        await fill();
        expect(root.value()).toBe('US');
        expect(field.hasAttribute('data-invalid')).toBe(true);
        expect(fixture.componentInstance.clears).toBe(0);
        fixture.componentInstance.cancel.set(false);
        await fill();
        expect(root.value()).toBe('CA');
        expect(field.hasAttribute('data-invalid')).toBe(false);
        expect(fixture.componentInstance.clears).toBe(1);
    });
});

describe('Select native input and autofill', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    let root: RdxSelectRoot;
    async function settle() {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    async function mount(configure: (host: Host) => void = () => undefined) {
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        configure(host);
        await settle();
        root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
    }
    async function autofill(value: string) {
        const input = root.nativeInput()!;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        await Promise.resolve();
        await settle();
        await settle();
    }
    beforeEach(() => TestBed.configureTestingModule({ imports: [Host] }));

    it('creates one scalar submission input and keeps attributes and refs reactive', async () => {
        const refs: (HTMLInputElement | null)[] = [];
        const replacements: (HTMLInputElement | null)[] = [];
        await mount((host) => host.ref.set((input) => refs.push(input)));
        const input = root.nativeInput()!;
        expect(input.type).toBe('text');
        expect(input.autocomplete).toBe('country');
        expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('country')).toEqual(['']);
        host.autoComplete.set('country-name');
        host.required.set(true);
        host.readOnly.set(true);
        host.ref.set((input) => replacements.push(input));
        await settle();
        expect(input.autocomplete).toBe('country-name');
        expect(input.required).toBe(true);
        expect(input.readOnly).toBe(true);
        expect(refs).toEqual([input, null]);
        expect(replacements).toEqual([input]);
        fixture.destroy();
        expect(root.nativeInput()).toBeNull();
        expect(replacements).toEqual([input, null]);
    });

    for (const text of ['ca', 'CANADA']) {
        it(`matches ${text} against options before the popup first opens`, async () => {
            await mount();
            expect(document.querySelector('[rdxSelectItem]')).toBeNull();
            await autofill(text);
            expect(host.value()).toBe('CA');
            expect(root.nativeInput()?.value).toBe('CA');
            expect(host.events).toHaveLength(1);
            expect(host.events[0].eventDetails.reason).toBe('none');
            expect(root.formUi.dirtyState()).toBe(true);
            expect(host.open()).toBe(false);
            expect(document.querySelector('[rdxSelectPopup]')).toBeNull();
        });
    }

    it('prefers serialized values to an earlier rendered label, including items without ItemText', async () => {
        await mount((host) => {
            host.itemText.set(false);
            host.options.set([
                { value: 'CA', label: 'US' },
                { value: 'US', label: 'United States' }
            ]);
        });
        await autofill('US');
        expect(host.value()).toBe('US');
    });

    it('preserves object identity through label and serialization callbacks', async () => {
        const canada = { code: 'CA', country: 'Canada' };
        await mount((host) => {
            host.options.set([{ value: canada, label: 'Canada' }]);
            host.serialize.set((value) => (value as typeof canada).code);
            host.label.set((value) => (value as typeof canada).country);
        });
        await autofill('canada');
        expect(host.value()).toBe(canada);
        expect(root.nativeInput()?.value).toBe('CA');
    });

    for (const lock of ['disabled', 'readOnly', 'multiple'] as const) {
        it(`ignores autofill in ${lock} mode`, async () => {
            await mount((host) => host[lock].set(true));
            await autofill('CA');
            expect(host.events).toHaveLength(0);
            expect(root.formUi.dirtyState()).toBe(false);
        });
    }

    it('restores the committed native value when selection is canceled or unmatched', async () => {
        await mount((host) => host.value.set('US'));
        host.cancel = true;
        await autofill('CA');
        expect(host.value()).toBe('US');
        expect(root.nativeInput()?.value).toBe('US');
        expect(root.formUi.dirtyState()).toBe(false);
        host.cancel = false;
        await autofill('unknown');
        expect(host.events).toHaveLength(1);
        expect(root.nativeInput()?.value).toBe('US');
    });

    it('keeps multiple submission entries separate from the nameless validation input', async () => {
        await mount((host) => {
            host.multiple.set(true);
            host.value.set(['US', 'CA']);
            host.required.set(true);
        });
        const input = root.nativeInput()!;
        expect(input.hasAttribute('name')).toBe(false);
        expect(input.required).toBe(false);
        expect(new FormData(fixture.nativeElement.querySelector('form')).getAll('country')).toEqual(['US', 'CA']);
        host.value.set([]);
        await settle();
        expect(input.required).toBe(true);
        expect(input.checkValidity()).toBe(false);
    });
});
