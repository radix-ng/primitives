import { Component, signal } from '@angular/core';
import {
    RdxProgressIndicatorDirective,
    RdxProgressLabelDirective,
    RdxProgressRootDirective,
    RdxProgressTrackDirective,
    RdxProgressValueDirective
} from '@radix-ng/primitives/progress';

@Component({
    selector: 'audit-progress-view',
    imports: [
        RdxProgressRootDirective,
        RdxProgressLabelDirective,
        RdxProgressTrackDirective,
        RdxProgressIndicatorDirective,
        RdxProgressValueDirective
    ],
    template: `
        <span id="progress-external-label">External transfer progress</span>
        <div
            [value]="value()"
            [aria-labelledby]="showLabel() ? undefined : 'progress-external-label'"
            rdxProgressRoot
            data-progress-node="root"
        >
            @if (showLabel()) {
                <span rdxProgressLabel data-progress-node="label">Transfer progress</span>
            }
            <span rdxProgressValue data-progress-node="value"></span>
            <div rdxProgressTrack data-progress-node="track">
                <div rdxProgressIndicator data-progress-node="indicator"></div>
            </div>
        </div>
        <button (click)="value.set(80)" type="button">Advance progress</button>
        <button (click)="showLabel.set(!showLabel())" type="button">Toggle progress label</button>
    `
})
export class ProgressAuditView {
    protected readonly value = signal(25);
    protected readonly showLabel = signal(true);
}
