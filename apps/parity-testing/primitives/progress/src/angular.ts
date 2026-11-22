import { Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxProgressIndicatorDirective,
    RdxProgressLabelDirective,
    RdxProgressRootDirective,
    RdxProgressTrackDirective,
    RdxProgressValueDirective
} from '@radix-ng/primitives/progress';
import { describeProgress, installFixture } from './contract';
import './fixture.css';

const fixture = installFixture();

@Component({
    selector: 'parity-progress',
    imports: [
        RdxProgressRootDirective,
        RdxProgressLabelDirective,
        RdxProgressTrackDirective,
        RdxProgressIndicatorDirective,
        RdxProgressValueDirective
    ],
    template: `
        <span id="external-progress">External progress</span>
        <div
            #progress="rdxProgressRoot"
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
            rdxProgressRoot
            data-part="root"
            aria-label="Fallback progress"
        >
            @if (step().showLabel !== false) {
                <span [id]="step().labelId" rdxProgressLabel data-part="label">Transfer progress</span>
            }
            <span rdxProgressValue data-part="value"></span>
            @if (svg) {
                <svg rdxProgressTrack data-part="track" width="100" height="100" viewBox="0 0 100 100">
                    <circle
                        [attr.stroke-dasharray]="
                            progress.percentageState() === null ? null : progress.percentageState() + ' 100'
                        "
                        rdxProgressIndicator
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
                <div class="progress-track" rdxProgressTrack data-part="track">
                    <div class="progress-fill" rdxProgressIndicator data-part="indicator"></div>
                </div>
            }
        </div>
        <button (click)="index.update(advance)" type="button">Advance</button>
    `
})
class ProgressFixture {
    protected readonly index = signal(0);
    protected readonly step = computed(() => fixture.steps[this.index()]);
    protected readonly svg = fixture.svg;
    protected readonly describe = describeProgress;
    protected readonly advance = (index: number) => Math.min(index + 1, fixture.steps.length - 1);
}
void bootstrapApplication(ProgressFixture, { providers: [provideZonelessChangeDetection()] });
