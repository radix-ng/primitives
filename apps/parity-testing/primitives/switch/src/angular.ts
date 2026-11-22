import { NgTemplateOutlet } from '@angular/common';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxSwitchInput,
    RdxSwitchRoot,
    RdxSwitchThumb,
    type RdxSwitchCheckedChangeEvent
} from '@radix-ng/primitives/switch';
import { formId, initialDefault, installProbe, isControlled, record, required, scenario } from './contract';

installProbe();

@Component({
    selector: 'parity-switch',
    imports: [NgTemplateOutlet, RdxSwitchRoot, RdxSwitchThumb, RdxSwitchInput],
    template: `
        <form id="preferences">
            @if (!formId) {
                <ng-container [ngTemplateOutlet]="control" />
            }
            <button id="save" type="submit">Save</button>
            <button id="reset" type="reset">Reset</button>
        </form>
        @if (formId) {
            <ng-container [ngTemplateOutlet]="control" />
        }
        <ng-template #control>
            <label for="alerts">Alerts</label>
            <button
                id="alerts"
                [controlledChecked]="controlled()"
                [defaultChecked]="defaultChecked()"
                [disabled]="disabled"
                [readonly]="readOnly"
                [required]="required"
                [form]="formId"
                (onCheckedChange)="request($event)"
                name="alerts"
                value="yes"
                uncheckedValue="no"
                rdxSwitchRoot
            >
                <span rdxSwitchThumb data-testid="thumb"></span>
                @if (authored) {
                    <input rdxSwitchInput />
                }
            </button>
        </ng-template>
        <button (click)="defaultChecked.set(!defaultChecked())" type="button">Change default</button>
        <button (click)="apply()" type="button">Apply request</button>
    `
})
class SwitchFixture {
    protected readonly required = required;
    protected readonly formId = formId;
    protected readonly authored = scenario === 'authored';
    protected readonly readOnly = scenario === 'readonly';
    protected readonly disabled = scenario === 'disabled';
    protected readonly defaultChecked = signal(initialDefault);
    protected readonly controlled = signal(isControlled ? false : undefined);
    private latest?: boolean;

    protected request(event: RdxSwitchCheckedChangeEvent): void {
        record(event.checked, event.eventDetails);
        this.latest = event.checked;
    }

    protected apply(): void {
        this.controlled.set(this.latest);
    }
}

void bootstrapApplication(SwitchFixture, { providers: [provideZonelessChangeDetection()] });
