import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect } from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect],
    template: `
        <div [(value)]="value" [(open)]="open" [modal]="modal()" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxSelectItem>
                                <span rdxSelectItemText>{{ fruit }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class Host {
    readonly value = signal<string | undefined>(undefined);
    readonly open = signal(false);
    readonly modal = signal(true);
    readonly fruits = ['Apple', 'Banana'];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect, RdxFieldRoot],
    template: `
        <div [invalid]="invalid()" [required]="required()" rdxFieldRoot>
            <button rdxSelectTrigger rdxSelectRoot>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>
        </div>
    `
})
class FieldHost {
    readonly invalid = signal(false);
    readonly required = signal(false);
}

describe('Select data attributes', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function trigger(): HTMLElement {
        return fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    });

    it('trigger reflects placeholder and popup-open state', async () => {
        expect(trigger().hasAttribute('data-placeholder')).toBe(true);
        expect(trigger().hasAttribute('data-popup-open')).toBe(false);

        host.open.set(true);
        await settle();
        expect(trigger().hasAttribute('data-popup-open')).toBe(true);

        host.value.set('Apple');
        host.open.set(false);
        await settle();
        expect(trigger().hasAttribute('data-placeholder')).toBe(false);
        expect(trigger().hasAttribute('data-filled')).toBe(true);
    });

    it('links the open trigger to the listbox with a stable content id', async () => {
        expect(trigger().getAttribute('aria-controls')).toBeNull();

        host.open.set(true);
        await settle();

        const controls = trigger().getAttribute('aria-controls');
        const popup = controls ? document.getElementById(controls) : null;

        expect(controls).toMatch(/^rdx-select-content-/);
        expect(popup).toBeTruthy();
        expect(popup?.getAttribute('role')).toBe('listbox');

        host.open.set(false);
        await settle();

        expect(trigger().getAttribute('aria-controls')).toBeNull();
    });

    it('modal locks body scroll while open and restores on close', async () => {
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
        host.open.set(true);
        await settle();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(true);
        host.open.set(false);
        await settle();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });

    it('non-modal does not lock scroll', async () => {
        host.modal.set(false);
        await settle();
        host.open.set(true);
        await settle();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });
});

describe('Select Field integration on the trigger', () => {
    let fixture: ComponentFixture<FieldHost>;
    let host: FieldHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function trigger(): HTMLElement {
        return fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [FieldHost] });
        fixture = TestBed.createComponent(FieldHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('propagates field invalid/required state to the trigger', async () => {
        host.invalid.set(true);
        host.required.set(true);
        await settle();
        expect(trigger().getAttribute('data-invalid')).toBe('');
        expect(trigger().getAttribute('aria-invalid')).toBe('true');
        expect(trigger().getAttribute('data-required')).toBe('');
        expect(trigger().getAttribute('aria-required')).toBe('true');
    });
});

describe('Select structural portal', () => {
    it('throws in dev mode when rdxSelectPortal is used as an attribute instead of structurally', () => {
        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
            imports: [_importsSelect],
            template: `
                <div rdxSelectRoot>
                    <button rdxSelectTrigger>
                        <span rdxSelectValue placeholder="Select…"></span>
                    </button>

                    <div rdxSelectPortal>
                        <div rdxSelectPopup>Oops</div>
                    </div>
                </div>
            `
        })
        class MisuseHost {}

        expect(() => {
            const fixture = TestBed.createComponent(MisuseHost);
            fixture.detectChanges();
        }).toThrow(/structural directive/);
    });
});
