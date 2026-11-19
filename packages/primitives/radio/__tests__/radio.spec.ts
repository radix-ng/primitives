import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, type RdxFormErrors } from '@radix-ng/primitives/form';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective,
    RdxRadioValueChangeEvent
} from '../index';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective, RdxRadioIndicatorDirective],
    template: `
        <form>
            <div
                [value]="value"
                [disabled]="disabled"
                [required]="required"
                [readOnly]="readonly"
                (onValueChange)="onValueChange($event)"
                rdxRadioRoot
                name="density"
            >
                <button id="default" rdxRadioItem value="default">
                    <span rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </button>
                <button id="comfortable" rdxRadioItem value="comfortable">
                    <span rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </button>
            </div>
        </form>
    `
})
class RadioHost {
    value: string | null = 'default';
    disabled = false;
    required = false;
    readonly = false;
    changes: string[] = [];
    lastReason: string | undefined;
    cancelNext = false;

    onValueChange(change: RdxRadioValueChangeEvent): void {
        this.changes.push(change.value);
        this.lastReason = change.eventDetails.reason;
        if (this.cancelNext) {
            change.eventDetails.cancel();
            this.cancelNext = false;
            return;
        }
        this.value = change.value;
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective, RdxRadioIndicatorDirective],
    template: `
        <form>
            <div [value]="value" (onValueChange)="onValueChange($event)" rdxRadioRoot name="storage">
                <label>
                    <span rdxRadioItem value="ssd">
                        <span rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    SSD
                </label>
                <label>
                    <span rdxRadioItem value="hdd">
                        <span rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    HDD
                </label>
            </div>
        </form>
    `
})
class LabelWrappedRadioHost {
    value: string | null = 'ssd';
    changes: string[] = [];
    cancelNext = false;
    lastChange?: RdxRadioValueChangeEvent;

    onValueChange(change: RdxRadioValueChangeEvent): void {
        this.changes.push(change.value);
        this.lastChange = change;
        if (this.cancelNext) {
            change.eventDetails.cancel();
            this.cancelNext = false;
            return;
        }
        this.value = change.value;
    }
}

describe('RdxRadio', () => {
    let fixture: ComponentFixture<RadioHost>;
    let host: RadioHost;

    const group = () => fixture.debugElement.query(By.css('[rdxRadioRoot]')).nativeElement as HTMLElement;
    const buttons = () =>
        fixture.debugElement
            .queryAll(By.css('button[rdxRadioItem]'))
            .map((el) => el.nativeElement as HTMLButtonElement);
    const inputs = () =>
        Array.from(fixture.nativeElement.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    const indicators = () =>
        fixture.debugElement.queryAll(By.css('[rdxRadioIndicator]')).map((el) => el.nativeElement as HTMLElement);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [RadioHost] });
        fixture = TestBed.createComponent(RadioHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('creates hidden radio inputs beside items for form integration', () => {
        expect(inputs()).toHaveLength(2);
        expect(inputs()[0].name).toBe('density');
        expect(inputs()[0].value).toBe('default');
        expect(inputs()[0].checked).toBe(true);
        expect(inputs()[1].checked).toBe(false);

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(new FormData(form).getAll('density')).toEqual(['default']);
    });

    it('does not change value when an unchecked item receives focus', () => {
        buttons()[1].focus();
        fixture.detectChanges();

        expect(host.value).toBe('default');
        expect(host.changes).toEqual([]);
    });

    it('seeds the tab stop from the checked item and keeps it after an external value write', () => {
        expect(buttons()[0].getAttribute('tabindex')).toBe('0');
        expect(buttons()[1].getAttribute('tabindex')).toBe('-1');

        host.value = 'comfortable';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(buttons()[0].getAttribute('tabindex')).toBe('0');
        expect(buttons()[1].getAttribute('tabindex')).toBe('-1');
        expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
    });

    it('does not select on programmatic focus after an ignored arrow key', async () => {
        for (const keyEvent of [
            new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true, bubbles: true }),
            new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true, bubbles: true })
        ]) {
            const [first, second] = buttons();
            first.focus();
            keyEvent.preventDefault();
            first.dispatchEvent(keyEvent);
            await fixture.whenStable();
            expect(document.activeElement).toBe(first);

            second.focus();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(document.activeElement).toBe(second);
            expect(host.changes).toEqual([]);
            expect(host.value).toBe('default');
        }
    });

    it('selects an item on click and emits once', () => {
        buttons()[1].click();
        fixture.detectChanges();

        expect(host.value).toBe('comfortable');
        expect(host.changes).toEqual(['comfortable']);
        expect(inputs()[1].checked).toBe(true);
    });

    it('allows canceling selection before state updates', () => {
        host.cancelNext = true;

        buttons()[1].click();
        fixture.detectChanges();

        expect(host.value).toBe('default');
        expect(host.changes).toEqual(['comfortable']);
        expect(inputs()[0].checked).toBe(true);
    });

    it('selects the newly focused item during arrow navigation', async () => {
        buttons()[0].focus();
        // Let the initial focus settle before the arrow press: its selection-follows-focus
        // microtask must run while arrow navigation is still off, so it stays a no-op.
        await Promise.resolve();

        buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        // Arrow nav moves focus on one microtask, then selection-follows-focus runs on the next
        // (a chained `queueMicrotask`); a macrotask drains the whole sequence in one await.
        await new Promise<void>((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(host.value).toBe('comfortable');
        expect(host.changes).toEqual(['comfortable']);
    });

    it('supports horizontal arrow navigation without an orientation input', async () => {
        buttons()[0].focus();
        await Promise.resolve();

        buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await new Promise<void>((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(buttons()[1]);
        expect(host.value).toBe('comfortable');
    });

    it('allows Shift+Arrow navigation like Base UI RadioGroup', async () => {
        buttons()[0].focus();
        await Promise.resolve();

        buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true }));
        await new Promise<void>((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(buttons()[1]);
        expect(host.value).toBe('comfortable');
    });

    it('does not use Home and End for radio group navigation', async () => {
        buttons()[0].focus();
        await Promise.resolve();

        buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await new Promise<void>((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(buttons()[0]);
        expect(host.value).toBe('default');
    });

    it('uses the Base UI none reason for value changes', () => {
        buttons()[1].click();
        fixture.detectChanges();

        expect(host.lastReason).toBe('none');
    });

    it('keeps authored Indicator hosts in their settled state on initial render', () => {
        const [checked, unchecked] = indicators();
        expect(checked.hasAttribute('data-checked')).toBe(true);
        expect(checked.style.display).not.toBe('none');
        expect(unchecked.hasAttribute('data-unchecked')).toBe(true);
        expect(unchecked.style.display).toBe('none');
        for (const indicator of [checked, unchecked]) {
            expect(indicator.hasAttribute('data-starting-style')).toBe(false);
            expect(indicator.hasAttribute('data-ending-style')).toBe(false);
        }
    });

    it('propagates group disabled and required state to items, indicators, and hidden inputs', () => {
        host.disabled = true;
        host.required = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(group().getAttribute('data-disabled')).toBe('');
        expect(buttons()[0].hasAttribute('disabled')).toBe(true);
        expect(buttons()[0].getAttribute('data-required')).toBe('');
        expect(indicators()[0].getAttribute('data-disabled')).toBe('');
        expect(inputs()[0].disabled).toBe(true);
        expect(inputs()[0].required).toBe(true);
    });

    it('does not select a different item when readonly', () => {
        host.readonly = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        buttons()[1].click();
        fixture.detectChanges();

        expect(host.value).toBe('default');
        expect(host.changes).toEqual([]);
        expect(buttons()[0].getAttribute('data-readonly')).toBe('');
    });

    it('marks the control touched only when focus leaves the group', () => {
        const groupDir = fixture.debugElement.query(By.css('[rdxRadioRoot]')).injector.get(RdxRadioGroupDirective);
        const touched = vi.fn();
        groupDir.registerOnTouched(touched);

        // Moving focus to a sibling item stays inside the group → not touched.
        buttons()[0].dispatchEvent(new FocusEvent('focusout', { relatedTarget: buttons()[1], bubbles: true }));
        expect(touched).not.toHaveBeenCalled();

        // Focus leaving the group → touched.
        buttons()[0].dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body, bubbles: true }));
        expect(touched).toHaveBeenCalledTimes(1);
    });

    it('supports label-wrapped non-button radio items', () => {
        const labelFixture = TestBed.createComponent(LabelWrappedRadioHost);
        labelFixture.detectChanges();
        const labelHost = labelFixture.componentInstance;

        const item = labelFixture.nativeElement.querySelector('[rdxRadioItem]') as HTMLElement;
        const labels = Array.from(labelFixture.nativeElement.querySelectorAll('label')) as HTMLLabelElement[];
        const input = labelFixture.nativeElement.querySelector('input[type="radio"]') as HTMLInputElement;

        expect(item.tagName).toBe('SPAN');
        expect(item.hasAttribute('type')).toBe(false);
        expect(input.name).toBe('storage');
        expect(input.value).toBe('ssd');

        labels[1].click();
        labelFixture.detectChanges();

        expect(labelHost.value).toBe('hdd');
        expect(labelHost.changes).toEqual(['hdd']);
    });

    it('keeps the previous FormData after vetoing a native label click', () => {
        const fixture = TestBed.createComponent(LabelWrappedRadioHost);
        fixture.detectChanges();
        const host = fixture.componentInstance;
        host.cancelNext = true;
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        const label = form.querySelectorAll('label')[1];
        const item = label.querySelector('[rdxRadioItem]');
        const native = label.querySelector('input');
        const notifications: string[] = [];
        form.addEventListener('change', (event) => notifications.push(event.type));

        label.click();
        fixture.detectChanges();
        expect(host.changes).toEqual(['hdd']);
        expect(host.lastChange?.eventDetails.trigger).toBe(item);
        expect(host.lastChange?.eventDetails.event.target).toBe(native);
        expect(new FormData(form).getAll('storage')).toEqual(['ssd']);
        expect(notifications).toEqual([]);
    });

    it('does not request an edit for a prevented host click', () => {
        const item = buttons()[1];
        const event = new MouseEvent('click', { cancelable: true, bubbles: true });
        event.preventDefault();
        item.dispatchEvent(event);
        fixture.detectChanges();
        expect(host.changes).toEqual([]);
        expect(inputs()[0].checked).toBe(true);
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RdxRadioGroupDirective, RdxRadioItemDirective],
    template: `
        <form id="checkout"></form>
        <div [formControl]="control" defaultValue="pro" rdxRadioRoot name="plan" form="checkout">
            <button rdxRadioItem value="free">Free</button>
            <button rdxRadioItem value="pro">Pro</button>
        </div>
    `
})
class NativeFormRadioHost {
    control = new FormControl<string | null>('free', { nonNullable: true });
}

describe('RdxRadioGroup native form contract', () => {
    it('serializes without item inputs and supports external form, disabled, and native reset', async () => {
        TestBed.configureTestingModule({ imports: [NativeFormRadioHost] });
        const fixture = TestBed.createComponent(NativeFormRadioHost);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        const items = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

        expect(new FormData(form).get('plan')).toBe('free');
        expect(fixture.nativeElement.querySelectorAll('input[type="radio"]')).toHaveLength(0);

        items[1].click();
        fixture.detectChanges();
        expect(host.control.value).toBe('pro');
        expect(host.control.dirty).toBe(true);
        expect(new FormData(form).get('plan')).toBe('pro');

        form.reset();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        fixture.detectChanges();
        expect(host.control.value).toBe('free');
        expect(host.control.pristine).toBe(true);
        expect(host.control.untouched).toBe(true);
        expect(new FormData(form).get('plan')).toBe('free');

        host.control.disable();
        fixture.detectChanges();
        expect(new FormData(form).has('plan')).toBe(false);
    });

    it('keeps a nullable FormControl empty at setup and restores its Angular reset baseline', async () => {
        TestBed.configureTestingModule({ imports: [NativeFormRadioHost] });
        const fixture = TestBed.createComponent(NativeFormRadioHost);
        const control = new FormControl<string | null>(null);
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        await fixture.whenStable();

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        const root = fixture.debugElement
            .query(By.directive(RdxRadioGroupDirective))
            .injector.get(RdxRadioGroupDirective);
        expect(root.value()).toBeNull();
        expect(new FormData(form).has('plan')).toBe(false);

        control.setValue('free');
        fixture.detectChanges();
        expect(new FormData(form).getAll('plan')).toEqual(['free']);

        form.reset();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        fixture.detectChanges();
        expect(control.value).toBeNull();
        expect(root.value()).toBeNull();
        expect(new FormData(form).has('plan')).toBe(false);
    });
});

@Component({
    imports: [FormsModule, RdxRadioGroupDirective, RdxRadioItemDirective],
    template: `
        <div [(ngModel)]="plan" defaultValue="free" rdxRadioRoot>
            <button rdxRadioItem value="free">Free</button>
            <button rdxRadioItem value="">No preference</button>
        </div>
    `
})
class RadioNgModelHost {
    plan: string | null = null;
}

it.each([null, ''])('gives an initial ngModel value of %j priority over the radio default', async (plan) => {
    const fixture = TestBed.createComponent(RadioNgModelHost);
    fixture.componentInstance.plan = plan;
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.debugElement.query(By.directive(RdxRadioGroupDirective)).injector.get(RdxRadioGroupDirective);
    expect(root.value()).toBe(plan);
    expect(fixture.componentInstance.plan).toBe(plan);
});

@Component({
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <form>
            <div
                [(value)]="value"
                [controlledValue]="controlledValue()"
                [defaultValue]="defaultValue()"
                rdxRadioRoot
                name="plan"
            >
                <button rdxRadioItem value="free">
                    Free
                    <input rdxRadioItemInput />
                </button>
                <button rdxRadioItem value="pro">
                    Pro
                    <input rdxRadioItemInput />
                </button>
            </div>
        </form>
    `
})
class RadioModelResetHost {
    readonly value = signal<string | null>('free');
    readonly controlledValue = signal<string | null | undefined>(undefined);
    readonly defaultValue = signal('pro');
}

it.each(['free', null])('restores the originally supplied radio model %j on native reset', async (initialValue) => {
    const fixture = TestBed.createComponent(RadioModelResetHost);
    const host = fixture.componentInstance;
    host.value.set(initialValue);
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const expected = initialValue === null ? [] : [initialValue];
    expect(new FormData(form).getAll('plan')).toEqual(expected);

    form.querySelectorAll('button')[1].click();
    host.defaultValue.set('other');
    fixture.detectChanges();
    expect(new FormData(form).getAll('plan')).toEqual(['pro']);

    form.reset();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(host.value()).toBe(initialValue);
    expect(new FormData(form).getAll('plan')).toEqual(expected);
});

it('preserves the latest parent selection on native reset without updating the editable model', async () => {
    const fixture = TestBed.createComponent(RadioModelResetHost);
    const host = fixture.componentInstance;
    host.controlledValue.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const root = fixture.debugElement.query(By.directive(RdxRadioGroupDirective)).injector.get(RdxRadioGroupDirective);
    expect(root.currentValue()).toBeNull();
    expect(new FormData(form).has('plan')).toBe(false);

    host.controlledValue.set('pro');
    fixture.detectChanges();
    form.reset();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(host.value()).toBe('free');
    expect(root.currentValue()).toBe('pro');
    expect(new FormData(form).getAll('plan')).toEqual(['pro']);

    host.controlledValue.set(undefined);
    fixture.detectChanges();
    expect(root.currentValue()).toBe('free');
    expect(new FormData(form).getAll('plan')).toEqual(['free']);

    form.querySelectorAll('button')[1].click();
    fixture.detectChanges();
    form.reset();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(host.value()).toBe('free');
    expect(new FormData(form).getAll('plan')).toEqual(['free']);
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <div [invalid]="invalid()" [errors]="errors()" rdxRadioRoot name="plan">
            <button id="free" rdxRadioItem value="free"><input rdxRadioItemInput /></button>
            <button id="pro" rdxRadioItem value="pro"><input rdxRadioItemInput /></button>
        </div>
    `
})
class RadioValidationHost {
    readonly invalid = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxRadioGroup validation state (batch #4)', () => {
    let fixture: ComponentFixture<RadioValidationHost>;
    let host: RadioValidationHost;
    let group: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [RadioValidationHost] });
        fixture = TestBed.createComponent(RadioValidationHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        group = fixture.debugElement.query(By.css('[rdxRadioRoot]')).nativeElement;
    });

    it('is valid by default', () => {
        expect(group.getAttribute('data-valid')).toBe('');
        expect(group.getAttribute('data-invalid')).toBeNull();
        expect(group.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(group.getAttribute('data-invalid')).toBe('');
        expect(group.getAttribute('aria-invalid')).toBe('true');
        expect(group.getAttribute('data-valid')).toBeNull();
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Pick a plan.' }]);
        fixture.detectChanges();
        expect(group.getAttribute('data-invalid')).toBe('');
        expect(group.getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a selection', () => {
        expect(group.getAttribute('data-dirty')).toBeNull();
        (fixture.debugElement.query(By.css('#free')).nativeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(group.getAttribute('data-dirty')).toBe('');
    });

    it('marks touched when focus leaves the group', () => {
        expect(group.getAttribute('data-touched')).toBeNull();
        group.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));
        fixture.detectChanges();
        expect(group.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <div [formField]="plan" defaultValue="free" rdxRadioRoot name="plan">
            <button id="free" rdxRadioItem value="free"><input rdxRadioItemInput /></button>
            <button id="pro" rdxRadioItem value="pro"><input rdxRadioItemInput /></button>
        </div>
    `
})
class RadioSignalFormHost {
    readonly model = signal<{ plan: string | null }>({ plan: null });
    readonly formTree = form(this.model, (path) => {
        required(path.plan);
    });

    get plan() {
        return this.formTree.plan;
    }
}

describe('RdxRadioGroup with Signal Forms', () => {
    let fixture: ComponentFixture<RadioSignalFormHost>;
    let host: RadioSignalFormHost;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [RadioSignalFormHost] });
        fixture = TestBed.createComponent(RadioSignalFormHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('preserves a null Signal Forms value over a supplied default', () => {
        const root = fixture.debugElement
            .query(By.directive(RdxRadioGroupDirective))
            .injector.get(RdxRadioGroupDirective);
        expect(root.value()).toBeNull();
        expect(host.plan().value()).toBeNull();
        expect(host.plan().dirty()).toBe(false);
        expect(fixture.nativeElement.querySelector('[aria-checked="true"]')).toBeNull();
    });

    it('updates the bound field on selection', () => {
        (fixture.debugElement.query(By.css('#pro')).nativeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(host.model().plan).toBe('pro');
    });

    it('reflects a programmatic field change', () => {
        host.model.update((value) => ({ ...value, plan: 'free' }));
        fixture.detectChanges();
        expect(host.plan().value()).toBe('free');
    });

    it('resets the value and interaction state through Signal Forms', () => {
        const pro = fixture.debugElement.query(By.css('#pro')).nativeElement as HTMLElement;
        const group = fixture.debugElement.query(By.css('[rdxRadioRoot]')).nativeElement as HTMLElement;
        pro.click();
        fixture.detectChanges();
        expect(group.getAttribute('data-dirty')).toBe('');

        host.formTree().reset({ plan: null });
        fixture.detectChanges();

        expect(host.model().plan).toBeNull();
        expect(host.plan().dirty()).toBe(false);
        expect(host.plan().touched()).toBe(false);
        expect(pro.getAttribute('aria-checked')).toBe('false');
        expect(group.getAttribute('data-dirty')).toBeNull();
        expect(group.getAttribute('data-touched')).toBeNull();
    });
});

@Component({
    imports: [FormField, RdxRadioGroupDirective, RdxRadioItemDirective],
    template: `
        <form>
            <div [formField]="fields.plan" rdxRadioRoot name="plan">
                <button [value]="standard" rdxRadioItem>Standard</button>
                <button [value]="premium" rdxRadioItem>Premium</button>
            </div>
        </form>
    `
})
class RadioObjectFormHost {
    readonly standard = { id: 1 };
    readonly premium = { id: 2 };
    readonly model = signal<{ plan: { id: number } | null }>({ plan: this.standard });
    readonly fields = form(this.model);
}

it('keeps object identity in Signal Forms and serializes only the native form entry', async () => {
    const fixture = TestBed.createComponent(RadioObjectFormHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    const premium = fixture.debugElement.queryAll(By.css('button'))[1].nativeElement as HTMLButtonElement;

    premium.click();
    fixture.detectChanges();

    expect(host.model().plan).toBe(host.premium);
    expect(premium.getAttribute('aria-checked')).toBe('true');
    expect([...new FormData(form).values()]).toEqual(['{"id":2}']);

    host.fields().reset({ plan: host.standard });
    fixture.detectChanges();

    expect(host.model().plan).toBe(host.standard);
    expect([...new FormData(form).values()]).toEqual(['{"id":1}']);
});

@Component({
    imports: [RdxFormRoot, RdxFieldRoot, RdxRadioGroupDirective, RdxRadioItemDirective],
    template: `
        <form [errors]="errors()" rdxFormRoot>
            <div rdxFieldRoot name="choice">
                <div [controlledValue]="controlled()" [defaultValue]="defaultValue()" rdxRadioRoot>
                    <button rdxRadioItem value="">No preference</button>
                    <button rdxRadioItem value="premium">Premium</button>
                </div>
            </div>
        </form>
    `
})
class RadioFieldResetHost {
    readonly controlled = signal<string | null | undefined>(undefined);
    readonly defaultValue = signal<string | undefined>('');
    readonly errors = signal<RdxFormErrors>({});
}

describe('Radio reset in Field and Form', () => {
    let fixture: ComponentFixture<RadioFieldResetHost>;
    const formElement = () => fixture.debugElement.query(By.directive(RdxFormRoot)).nativeElement as HTMLFormElement;
    const field = () => fixture.debugElement.query(By.directive(RdxFieldRoot)).nativeElement as HTMLDivElement;
    const premium = () => fixture.debugElement.queryAll(By.css('button'))[1].nativeElement as HTMLButtonElement;
    async function render() {
        fixture.detectChanges();
        await fixture.whenStable();
    }
    async function reset() {
        formElement().reset();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        await render();
    }

    beforeEach(() => {
        fixture = TestBed.createComponent(RadioFieldResetHost);
    });

    it.each([
        { initial: '', submitted: [''], filled: true },
        { initial: undefined, submitted: [], filled: false }
    ])(
        'derives filled from the restored group model with initial value $initial',
        async ({ initial, submitted, filled }) => {
            fixture.componentInstance.defaultValue.set(initial);
            await render();
            premium().click();
            await render();
            expect(field().hasAttribute('data-filled')).toBe(true);
            expect(field().hasAttribute('data-dirty')).toBe(true);
            expect(field().hasAttribute('data-touched')).toBe(true);

            await reset();

            expect(field().hasAttribute('data-filled')).toBe(filled);
            expect(field().hasAttribute('data-dirty')).toBe(false);
            expect(field().hasAttribute('data-touched')).toBe(false);
            expect(premium().getAttribute('aria-checked')).toBe('false');
            expect(new FormData(formElement()).getAll('choice')).toEqual(submitted);
        }
    );

    it('keeps a controlled selection and retains its filled state when the form resets', async () => {
        fixture.componentInstance.controlled.set('');
        await render();
        fixture.componentInstance.controlled.set('premium');
        await render();
        expect(field().hasAttribute('data-dirty')).toBe(true);

        await reset();

        expect(premium().getAttribute('aria-checked')).toBe('true');
        expect(new FormData(formElement()).getAll('choice')).toEqual(['premium']);
        expect(field().hasAttribute('data-filled')).toBe(true);
        expect(field().hasAttribute('data-dirty')).toBe(false);
    });

    it('preserves selection, interaction flags and external errors on a canceled native reset', async () => {
        await render();
        premium().click();
        fixture.componentInstance.errors.set({ choice: 'Plan is unavailable' });
        await render();
        expect(field().hasAttribute('data-invalid')).toBe(true);
        formElement().addEventListener('reset', (event) => event.preventDefault(), { once: true });

        await reset();

        expect(premium().getAttribute('aria-checked')).toBe('true');
        expect(new FormData(formElement()).getAll('choice')).toEqual(['premium']);
        expect(field().hasAttribute('data-filled')).toBe(true);
        expect(field().hasAttribute('data-dirty')).toBe(true);
        expect(field().hasAttribute('data-touched')).toBe(true);
        expect(field().hasAttribute('data-invalid')).toBe(true);
    });
});
