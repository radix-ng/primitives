import { Component, signal } from '@angular/core';
import { RdxFieldDescription, RdxFieldItem, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { config, installProbe } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [
        RdxFieldDescription,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxRadioGroupDirective,
        RdxRadioIndicatorDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective
    ],
    template: `
        @if (mode === 'external-required') {
            <form id="owner" (submit)="submit($event)">
                <button type="submit">Submit</button>
            </form>
            <div rdxRadioRoot form="owner" name="density" required aria-label="Density">
                <span data-testid="radio-a" rdxRadioItem value="a">
                    Alpha
                    <input rdxRadioItemInput />
                </span>
                <span data-testid="radio-b" rdxRadioItem value="b">
                    Beta
                    <input rdxRadioItemInput />
                </span>
            </div>
        } @else if (mode === 'eligible-items') {
            <form id="owner">
                <div rdxRadioRoot name="density" defaultValue="a" aria-label="Density">
                    @if (showAlpha()) {
                        <button [disabled]="disabled()" data-testid="radio-a" rdxRadioItem value="a">Alpha</button>
                    }
                    <button data-testid="radio-b" rdxRadioItem value="b">Beta</button>
                </div>
            </form>
            <button (click)="disabled.set(!disabled())" type="button">Toggle disabled</button>
            <button (click)="showAlpha.set(!showAlpha())" type="button">Toggle Alpha</button>
        } @else {
            <form id="owner">
                <div [disabled]="disabled()" data-testid="field" rdxFieldRoot name="density">
                    <span id="group-label" rdxFieldLabel>Density</span>
                    <p id="group-description" rdxFieldDescription>Pick a density</p>
                    <div rdxRadioRoot name="fallback-name">
                        <div rdxFieldItem>
                            <span data-testid="radio-a" rdxRadioItem value="a"><input rdxRadioItemInput /></span>
                            <label id="label-a" data-testid="label-a" rdxFieldLabel>Alpha</label>
                            <p id="description-a" rdxFieldDescription>Alpha description</p>
                        </div>
                        <div [disabled]="disableBeta()" rdxFieldItem>
                            <span data-testid="radio-b" rdxRadioItem value="b">
                                <span data-testid="indicator-b" rdxRadioIndicator keepMounted></span>
                                <input rdxRadioItemInput />
                            </span>
                            <label id="label-b" data-testid="label-b" rdxFieldLabel>Beta</label>
                            <p id="description-b" rdxFieldDescription>Beta description</p>
                        </div>
                    </div>
                </div>
            </form>
            <button (click)="disableBeta.set(!disableBeta())" type="button">Toggle Beta</button>
            <button (click)="disabled.set(!disabled())" type="button">Toggle disabled</button>
        }
    `
})
export class AngularRadioForms {
    protected readonly mode = config().forms;
    protected readonly disabled = signal(false);
    protected readonly disableBeta = signal(false);
    protected readonly showAlpha = signal(true);

    constructor() {
        installProbe();
    }

    protected submit(event: Event): void {
        event.preventDefault();
        (event.target as HTMLFormElement).dataset['submitted'] = 'true';
    }
}
