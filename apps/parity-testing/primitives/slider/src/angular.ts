import { NgTemplateOutlet } from '@angular/common';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderLabel,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    RdxSliderValue,
    type RdxSliderValueChangeEvent,
    type RdxSliderValueCommitEvent
} from '@radix-ng/primitives/slider';
import '../style.css';
import {
    alignment,
    collision,
    direction,
    externalForm,
    initialControlled,
    initialDefault,
    initialMin,
    installProbe,
    max,
    orientation,
    range,
    recordChange,
    recordCommit,
    step,
    thumbNames,
    type Value
} from './contract';

installProbe();

@Component({
    selector: 'parity-slider',
    imports: [
        NgTemplateOutlet,
        RdxSliderControl,
        RdxSliderIndicator,
        RdxSliderLabel,
        RdxSliderRoot,
        RdxSliderThumb,
        RdxSliderThumbInput,
        RdxSliderTrack,
        RdxSliderValue
    ],
    template: `
        <button id="before" type="button">Before</button>
        <form id="values">
            @if (!formId) {
                <ng-container [ngTemplateOutlet]="slider" />
            }
            <button type="reset">Reset</button>
        </form>
        @if (formId) {
            <ng-container [ngTemplateOutlet]="slider" />
        }
        <button (click)="defaults.set(80)" type="button">Change default</button>
        <button (click)="min.set(10)" type="button">Lower minimum</button>
        <button (click)="controlled.set(latest)" type="button">Apply request</button>
        <button (click)="controlled.set(35)" type="button">Replace value</button>
        <button (click)="disabled.set(!disabled())" type="button">Toggle disabled</button>
        <ng-template #slider>
            <div
                [controlledValue]="controlled()"
                [defaultValue]="defaults()"
                [disabled]="disabled()"
                [dir]="direction"
                [form]="formId"
                [min]="min()"
                [max]="max"
                [step]="step"
                [orientation]="orientation"
                [minStepsBetweenValues]="range ? 10 : 0"
                [thumbAlignment]="alignment"
                [thumbCollisionBehavior]="collision"
                (onValueChange)="request($event)"
                (onValueCommitted)="commit($event)"
                name="volume"
                rdxSliderRoot
            >
                <div rdxSliderLabel>Volume</div>
                <output rdxSliderValue data-testid="value"></output>
                <div class="control" rdxSliderControl data-testid="control">
                    <div class="track" rdxSliderTrack>
                        <div class="indicator" rdxSliderIndicator data-testid="indicator"></div>
                        @for (name of thumbNames; track $index) {
                            <div class="thumb" [index]="$index" rdxSliderThumb data-testid="thumb">
                                <input [aria-label]="name" rdxSliderThumbInput />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </ng-template>
    `
})
class SliderFixture {
    protected readonly alignment = alignment;
    protected readonly collision = collision;
    protected readonly direction = direction;
    protected readonly orientation = orientation;
    protected readonly formId = externalForm;
    protected readonly max = max;
    protected readonly step = step;
    protected readonly range = range;
    protected readonly thumbNames = thumbNames;
    protected readonly min = signal(initialMin);
    protected readonly defaults = signal<Value | undefined>(initialDefault);
    protected readonly controlled = signal<Value | undefined>(initialControlled);
    protected readonly disabled = signal(false);
    protected latest?: Value;

    protected request({ value, eventDetails }: RdxSliderValueChangeEvent): void {
        this.latest = value;
        recordChange(value, eventDetails);
    }

    protected commit({ value, eventDetails }: RdxSliderValueCommitEvent): void {
        recordCommit(value, eventDetails);
    }
}

void bootstrapApplication(SliderFixture, { providers: [provideZonelessChangeDetection()] });
