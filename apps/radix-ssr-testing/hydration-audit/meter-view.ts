import { Component, signal } from '@angular/core';
import {
    RdxMeterIndicatorDirective,
    RdxMeterLabelDirective,
    RdxMeterRootDirective,
    RdxMeterTrackDirective,
    RdxMeterValueDirective
} from '@radix-ng/primitives/meter';

@Component({
    selector: 'audit-meter-view',
    imports: [
        RdxMeterRootDirective,
        RdxMeterLabelDirective,
        RdxMeterTrackDirective,
        RdxMeterIndicatorDirective,
        RdxMeterValueDirective
    ],
    template: `
        <span id="meter-external-label">External storage</span>
        <div
            [value]="value()"
            [aria-labelledby]="showLabel() ? undefined : 'meter-external-label'"
            rdxMeterRoot
            data-meter-node="root"
        >
            @if (showLabel()) {
                <span rdxMeterLabel data-meter-node="label">Storage used</span>
            }
            <span rdxMeterValue data-meter-node="value"></span>
            <div rdxMeterTrack data-meter-node="track">
                <div rdxMeterIndicator data-meter-node="indicator"></div>
            </div>
        </div>
        <button (click)="value.set(80)" type="button">Advance meter</button>
        <button (click)="showLabel.set(!showLabel())" type="button">Toggle meter label</button>
    `
})
export class MeterAuditView {
    protected readonly value = signal(25);
    protected readonly showLabel = signal(true);
}
