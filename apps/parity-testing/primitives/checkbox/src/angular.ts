import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective,
    type RdxCheckboxCheckedChangeEvent,
    type RdxCheckboxGroupValueChangeEvent
} from '@radix-ng/primitives/checkbox';
import {
    group,
    groupDefault,
    initialChecked,
    initialDefault,
    initialGroup,
    installProbe,
    keepMounted,
    mixed,
    record,
    scenario,
    values
} from './contract';

const probe = installProbe();

@Component({
    selector: 'parity-checkbox',
    imports: [
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxGroupDirective
    ],
    styles: [
        `
            [data-testid='indicator'] {
                display: inline-block;
            }
            [data-testid='indicator'][data-ending-style] {
                animation: leave 400ms linear;
            }
            @keyframes leave {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `
    ],
    template: `
        <form id="form" (keydown.enter)="maybeCancelEnter($event)">
            @if (isGroup) {
                <div
                    [controlledValue]="groupValue()"
                    [defaultValue]="groupDefaultValue()"
                    [allValues]="values"
                    (onValueChange)="groupChange($event)"
                    rdxCheckboxGroup
                    aria-label="Features"
                >
                    <div (onCheckedChange)="request('parent', $event)" rdxCheckboxRoot parent>
                        <button rdxCheckboxButton>All</button>
                        <input rdxCheckboxInput />
                    </div>
                    @for (value of values; track value) {
                        @if (value !== 'b' || showB()) {
                            <div
                                [value]="value"
                                [name]="childName"
                                [disabled]="value === 'b' && disabledChild"
                                (onCheckedChange)="request(value, $event)"
                                rdxCheckboxRoot
                            >
                                <button [id]="'option-' + value" rdxCheckboxButton>{{ value }}</button>
                                <input rdxCheckboxInput />
                            </div>
                        }
                    }
                </div>
            } @else {
                <label for="terms">Terms</label>
                <div
                    [controlledChecked]="checked()"
                    [defaultChecked]="defaultChecked()"
                    [indeterminate]="mixed"
                    [readOnly]="readOnly"
                    [disabled]="disabled"
                    [required]="required"
                    [uncheckedValue]="uncheckedValue"
                    (onCheckedChange)="request('terms', $event)"
                    rdxCheckboxRoot
                    name="terms"
                    value="yes"
                >
                    <button id="terms" rdxCheckboxButton>
                        <span
                            [keepMounted]="keepMounted"
                            rdxCheckboxIndicator
                            data-testid="indicator"
                            aria-hidden="true"
                        >
                            ✓
                        </span>
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <button id="submit" type="submit">Submit</button>
            }
        </form>
        <button (click)="changeDefault()">Change default</button>
        <button (click)="apply()">Apply request</button>
        <button (click)="showB.set(false)">Remove b</button>
    `
})
class CheckboxFixture {
    protected readonly isGroup = group;
    protected readonly mixed = mixed;
    protected readonly keepMounted = keepMounted;
    protected readonly readOnly = scenario === 'readonly';
    protected readonly disabled = scenario === 'disabled';
    protected readonly required = scenario === 'form';
    protected readonly uncheckedValue = this.required ? 'no' : undefined;
    protected readonly childName = scenario === 'group-form' ? 'features' : undefined;
    protected readonly disabledChild = scenario === 'group-disabled-child';
    protected readonly values = values;
    protected readonly checked = signal(initialChecked);
    protected readonly defaultChecked = signal(initialDefault);
    protected readonly groupValue = signal(initialGroup);
    protected readonly groupDefaultValue = signal<string[] | undefined>(groupDefault);
    protected readonly showB = signal(true);
    private nextChecked?: boolean;
    private nextGroup?: string[];

    protected request(part: string, change: RdxCheckboxCheckedChangeEvent): void {
        if (record(part, change.checked, change.eventDetails) && part === 'terms') this.nextChecked = change.checked;
    }

    protected groupChange(change: RdxCheckboxGroupValueChangeEvent): void {
        if (record('group', change.value, change.eventDetails)) this.nextGroup = change.value;
    }

    protected maybeCancelEnter(event: Event): void {
        if (probe.cancelEnter) event.preventDefault();
    }

    protected changeDefault(): void {
        this.defaultChecked.update((value) => !value);
        this.groupDefaultValue.set(['a']);
    }

    protected apply(): void {
        if (this.isGroup) this.groupValue.set(this.nextGroup);
        else this.checked.set(this.nextChecked);
    }
}

void bootstrapApplication(CheckboxFixture, { providers: [provideZonelessChangeDetection()] });
