import { Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxMeterIndicatorDirective,
    RdxMeterLabelDirective,
    RdxMeterRootDirective,
    RdxMeterTrackDirective,
    RdxMeterValueDirective
} from '@radix-ng/primitives/meter';
import { describeMeter, displayMeter, installFixture } from './contract';
import './fixture.css';

const fixture = installFixture();

@Component({
    selector: 'parity-meter',
    imports: [
        RdxMeterRootDirective,
        RdxMeterLabelDirective,
        RdxMeterTrackDirective,
        RdxMeterIndicatorDirective,
        RdxMeterValueDirective
    ],
    template: `
        <span id="external-meter">External storage</span>
        <div
            #meter="rdxMeterRoot"
            [value]="step().value"
            [min]="step().min ?? 0"
            [max]="step().max ?? 100"
            [locale]="step().locale ?? 'en-US'"
            [format]="step().format"
            [getAriaValueText]="step().describeValue ? describe : undefined"
            [aria-labelledby]="step().labelledBy"
            [aria-valuetext]="step().ariaText"
            [attr.dir]="step().direction ?? 'ltr'"
            [attr.data-step]="index()"
            rdxMeterRoot
            aria-label="Fallback storage"
            data-part="root"
        >
            @if (step().showLabel !== false) {
                <span [id]="step().labelId" rdxMeterLabel data-part="label">Storage used</span>
            }
            <span [getValueText]="step().customizeValue ? display : undefined" rdxMeterValue data-part="value"></span>
            @if (svg) {
                <svg rdxMeterTrack data-part="track" width="100" height="100" viewBox="0 0 100 100">
                    <circle
                        [attr.stroke-dasharray]="meter.percentageState() + ' 100'"
                        rdxMeterIndicator
                        data-part="indicator"
                        cx="50"
                        cy="50"
                        r="25"
                        pathLength="100"
                        stroke="black"
                        stroke-width="4"
                        fill="none"
                    />
                </svg>
            } @else {
                <div class="meter-track" rdxMeterTrack data-part="track">
                    <div class="meter-fill" rdxMeterIndicator data-part="indicator"></div>
                </div>
            }
        </div>
        <button (click)="index.update(advance)" type="button">Advance</button>
    `
})
class MeterFixture {
    protected readonly index = signal(0);
    protected readonly step = computed(() => fixture.steps[this.index()]);
    protected readonly svg = fixture.svg;
    protected readonly describe = describeMeter;
    protected readonly display = displayMeter;
    protected readonly advance = (index: number) => Math.min(index + 1, fixture.steps.length - 1);
}

void bootstrapApplication(MeterFixture, { providers: [provideZonelessChangeDetection()] });
