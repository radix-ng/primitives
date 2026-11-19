import { Component, signal } from '@angular/core';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldItem,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormRoot, type RdxFormSubmitEvent } from '@radix-ng/primitives/form';
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
        RdxFieldError,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFieldsetLegend,
        RdxFieldsetRoot,
        RdxFormRoot,
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
        } @else if (mode === 'fieldset-legend') {
            <fieldset rdxFieldsetRoot>
                @if (showLegend()) {
                    <legend [id]="legendId()" rdxFieldsetLegend>Legend density</legend>
                }
                <div rdxFieldRoot>
                    @if (showFieldLabel()) {
                        <span id="field-density" rdxFieldLabel>Field density</span>
                    }
                    <div [aria-labelledby]="explicitLabel() ? 'explicit-density' : undefined" rdxRadioRoot>
                        <span rdxRadioItem value="a">Alpha</span>
                        <span rdxRadioItem value="b">Beta</span>
                    </div>
                </div>
            </fieldset>
            <span id="explicit-density">Explicit density</span>
            <button (click)="showLegend.set(!showLegend())" type="button">Toggle legend</button>
            <button (click)="legendId.set('new-legend')" type="button">Change legend ID</button>
            <button (click)="showFieldLabel.set(!showFieldLabel())" type="button">Toggle Field label</button>
            <button (click)="explicitLabel.set(!explicitLabel())" type="button">Toggle explicit label</button>
        } @else if (mode === 'nested-fields') {
            <form id="owner" (onFormSubmit)="nestedValues.set($event.values)" rdxFormRoot>
                <div rdxFieldRoot name="density">
                    <span rdxFieldLabel>Density</span>
                    <p id="density-description" rdxFieldDescription>Choose a row density</p>
                    <div rdxFieldRoot name="theme">
                        <span rdxFieldLabel>Theme</span>
                        <p id="theme-description" rdxFieldDescription>Choose a color theme</p>
                        <div rdxRadioRoot required>
                            <div rdxFieldItem disabled>
                                <span rdxRadioItem value="light"><input rdxRadioItemInput /></span>
                                <label rdxFieldLabel>Light</label>
                            </div>
                            <div rdxFieldItem>
                                <span rdxRadioItem value="dark"><input rdxRadioItemInput /></span>
                                <label data-testid="dark-label" rdxFieldLabel>Dark</label>
                                <p id="dark-description" rdxFieldDescription>Use dark colors</p>
                            </div>
                        </div>
                        <p id="theme-missing" rdxFieldError match="valueMissing">Theme is required</p>
                    </div>
                    <div rdxRadioRoot required>
                        <div rdxFieldItem>
                            <span rdxRadioItem value="compact"><input rdxRadioItemInput /></span>
                            <label rdxFieldLabel>Compact</label>
                        </div>
                        <div rdxFieldItem>
                            <span rdxRadioItem value="comfortable"><input rdxRadioItemInput /></span>
                            <label rdxFieldLabel>Comfortable</label>
                        </div>
                    </div>
                    <p id="density-missing" rdxFieldError match="valueMissing">Density is required</p>
                </div>
                <button type="submit">Submit</button>
                <output data-testid="submitted">
                    {{ nestedValues()?.['theme'] }} {{ nestedValues()?.['density'] }}
                </output>
            </form>
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
    protected readonly showLegend = signal(true);
    protected readonly legendId = signal('default-legend');
    protected readonly showFieldLabel = signal(false);
    protected readonly explicitLabel = signal(false);
    protected readonly nestedValues = signal<RdxFormSubmitEvent['values'] | null>(null);

    constructor() {
        installProbe();
    }

    protected submit(event: Event): void {
        event.preventDefault();
        (event.target as HTMLFormElement).dataset['submitted'] = 'true';
    }
}
