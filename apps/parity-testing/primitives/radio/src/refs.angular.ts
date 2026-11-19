import { Component, signal } from '@angular/core';
import { RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective } from '@radix-ng/primitives/radio';
import { config, installInputRefs, installProbe } from './contract';

@Component({
    selector: 'parity-radio',
    imports: [RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <form>
            @if (showGroup()) {
                <div
                    [controlledValue]="value()"
                    [inputRef]="alternate() ? refs.alternate : refs.primary"
                    (onValueChange)="value.set($event.value)"
                    rdxRadioRoot
                    name="density"
                    aria-label="Density"
                >
                    <span [disabled]="disableAlpha()" rdxRadioItem value="a">
                        Alpha
                        <input rdxRadioItemInput />
                    </span>
                    @if (showBeta()) {
                        <span [inputRef]="refs.item" rdxRadioItem value="b">
                            Beta
                            <input rdxRadioItemInput />
                        </span>
                    }
                </div>
            }
        </form>
        <button (click)="value.set(null)" type="button">Clear selection</button>
        <button (click)="alternate.set(true)" type="button">Replace callback</button>
        <button (click)="showBeta.set(!showBeta())" type="button">Toggle Beta</button>
        <button (click)="disableAlpha.set(!disableAlpha())" type="button">Toggle Alpha disabled</button>
        <button (click)="showGroup.set(false)" type="button">Remove group</button>
        <button (click)="renderCount.set(renderCount() + 1)" type="button">Rerender ({{ renderCount() }})</button>
    `
})
export class AngularRadioRefs {
    protected readonly value = signal<string | null>(null);
    protected readonly alternate = signal(false);
    protected readonly showBeta = signal(true);
    protected readonly showGroup = signal(true);
    protected readonly disableAlpha = signal(config().refs === 'detach');
    protected readonly renderCount = signal(0);
    protected readonly refs = (() => {
        installProbe();
        return installInputRefs();
    })();
}
