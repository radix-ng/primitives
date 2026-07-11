import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect } from '../index';
import { RdxSelectRoot, RdxSelectValueChangeEvent } from '../src/select-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, _importsSelect],
    template: `
        <div [defaultValue]="'Apple'" [formControl]="control" (onValueChange)="handleValueChange($event)" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select…">
                    {{ selectedValue.slotText() }}
                </span>
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
class SelectReactiveFormsHost {
    readonly control = new FormControl('Banana', { nonNullable: true });
    readonly cancelNextValue = signal(false);
    readonly fruits = ['Apple', 'Banana'];

    handleValueChange(event: RdxSelectValueChangeEvent): void {
        if (this.cancelNextValue()) {
            event.eventDetails.cancel();
        }
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, _importsSelect],
    template: `
        <div [(ngModel)]="value" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select…">
                    {{ selectedValue.slotText() }}
                </span>
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
class SelectTemplateDrivenFormsHost {
    value = 'Banana';
    readonly fruits = ['Apple', 'Banana'];
}

interface Framework {
    id: string;
    label: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, _importsSelect],
    template: `
        <div
            [formControl]="control"
            [isItemEqualToValue]="'id'"
            [itemToStringLabel]="itemToStringLabel"
            multiple
            rdxSelectRoot
        >
            <button rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select frameworks…">
                    {{ selectedValue.slotText() }}
                </span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (framework of frameworks; track framework.id) {
                            <div [value]="framework" rdxSelectItem>
                                <span rdxSelectItemText>{{ framework.label }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class SelectMultipleReactiveFormsHost {
    readonly frameworks: Framework[] = [
        { id: 'angular', label: 'Angular' },
        { id: 'react', label: 'React' }
    ];
    readonly control = new FormControl<Framework[]>([this.frameworks[0]], { nonNullable: true });
    readonly itemToStringLabel = (framework: Framework) => framework.label;
}

async function selectPreviousItem(fixture: ComponentFixture<unknown>, settle: () => Promise<void>): Promise<void> {
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
}

async function selectNextItem(fixture: ComponentFixture<unknown>, settle: () => Promise<void>): Promise<void> {
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();
    document
        .querySelector('[rdxSelectPopup]')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
}

function selectRoot(fixture: ComponentFixture<unknown>): RdxSelectRoot {
    return fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
}

describe('Select with Reactive Forms', () => {
    let fixture: ComponentFixture<SelectReactiveFormsHost>;
    let host: SelectReactiveFormsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectReactiveFormsHost] });
        fixture = TestBed.createComponent(SelectReactiveFormsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('lets the form value win over defaultValue and accepts programmatic writes', async () => {
        expect(selectRoot(fixture).value()).toBe('Banana');

        host.control.setValue('Apple');
        await settle();

        expect(selectRoot(fixture).value()).toBe('Apple');
        expect(fixture.nativeElement.querySelector('[rdxSelectTrigger]').textContent).toContain('Apple');
    });

    it('updates and touches the FormControl from user interaction', async () => {
        await selectPreviousItem(fixture, settle);

        expect(host.control.value).toBe('Apple');
        expect(host.control.dirty).toBe(true);

        fixture.nativeElement.querySelector('[rdxSelectTrigger]').dispatchEvent(new FocusEvent('blur'));
        await settle();

        expect(host.control.touched).toBe(true);
    });

    it('does not notify the FormControl when onValueChange is canceled', async () => {
        host.cancelNextValue.set(true);
        await selectPreviousItem(fixture, settle);

        expect(host.control.value).toBe('Banana');
        expect(host.control.pristine).toBe(true);
    });

    it('merges form-owned disabled state and restores it on enable', async () => {
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');

        host.control.disable();
        await settle();

        expect(trigger.disabled).toBe(true);
        expect(trigger.getAttribute('data-disabled')).toBe('');

        host.control.enable();
        await settle();

        expect(trigger.disabled).toBe(false);
        expect(trigger.getAttribute('data-disabled')).toBeNull();
    });

    it('restores the visible value when the FormControl resets', async () => {
        await selectPreviousItem(fixture, settle);
        expect(host.control.value).toBe('Apple');

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxSelectTrigger]');
        trigger.dispatchEvent(new FocusEvent('blur'));
        await settle();
        expect(trigger.getAttribute('data-dirty')).toBe('');
        expect(trigger.getAttribute('data-touched')).toBe('');

        host.control.reset('Banana');
        await settle();

        expect(host.control.value).toBe('Banana');
        expect(host.control.pristine).toBe(true);
        expect(host.control.untouched).toBe(true);
        expect(selectRoot(fixture).value()).toBe('Banana');
        expect(trigger.textContent).toContain('Banana');
        expect(trigger.getAttribute('data-dirty')).toBeNull();
        expect(trigger.getAttribute('data-touched')).toBeNull();
    });
});

describe('Select with template-driven forms', () => {
    let fixture: ComponentFixture<SelectTemplateDrivenFormsHost>;
    let host: SelectTemplateDrivenFormsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectTemplateDrivenFormsHost] });
        fixture = TestBed.createComponent(SelectTemplateDrivenFormsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('round-trips values through ngModel', async () => {
        expect(selectRoot(fixture).value()).toBe('Banana');

        await selectPreviousItem(fixture, settle);
        expect(host.value).toBe('Apple');

        host.value = 'Banana';
        fixture.changeDetectorRef.markForCheck();
        await settle();
        expect(selectRoot(fixture).value()).toBe('Banana');
    });
});

describe('Select multiple object values with Reactive Forms', () => {
    let fixture: ComponentFixture<SelectMultipleReactiveFormsHost>;
    let host: SelectMultipleReactiveFormsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectMultipleReactiveFormsHost] });
        fixture = TestBed.createComponent(SelectMultipleReactiveFormsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('preserves object identity and array values through the CVA', async () => {
        expect(selectRoot(fixture).value()).toEqual([host.frameworks[0]]);

        await selectNextItem(fixture, settle);

        expect(host.control.value).toEqual(host.frameworks);

        host.control.setValue([host.frameworks[1]]);
        await settle();
        expect(selectRoot(fixture).value()).toEqual([host.frameworks[1]]);
    });
});
