import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

    onValueChange(change: RdxRadioValueChangeEvent): void {
        this.changes.push(change.value);
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
        expect(new FormData(form).get('density')).toBe('default');
    });

    it('does not change value when an unchecked item receives focus', () => {
        buttons()[1].focus();
        fixture.detectChanges();

        expect(host.value).toBe('default');
        expect(host.changes).toEqual([]);
    });

    it('keeps the tab stop on the checked item', () => {
        expect(buttons()[0].getAttribute('tabindex')).toBe('0');
        expect(buttons()[1].getAttribute('tabindex')).toBe('-1');

        host.value = 'comfortable';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(buttons()[0].getAttribute('tabindex')).toBe('-1');
        expect(buttons()[1].getAttribute('tabindex')).toBe('0');
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
});
