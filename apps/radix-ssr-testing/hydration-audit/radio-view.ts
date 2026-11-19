import { Component, signal } from '@angular/core';
import { RdxFieldDescription, RdxFieldItem, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioIndicatorPresenceDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';

@Component({
    selector: 'audit-radio-view',
    imports: [
        RdxFieldDescription,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFieldsetLegend,
        RdxFieldsetRoot,
        RdxFormRoot,
        RdxRadioGroupDirective,
        RdxRadioIndicatorDirective,
        RdxRadioIndicatorPresenceDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective
    ],
    template: `
        <form data-radio-audit rdxFormRoot>
            <fieldset rdxFieldsetRoot>
                <legend data-radio-node="legend" rdxFieldsetLegend>Plan</legend>
                <div rdxFieldRoot name="plan">
                    <p rdxFieldDescription>Choose one plan.</p>
                    <div
                        (onValueChange)="requests.update(increment)"
                        data-radio-node="group"
                        rdxRadioRoot
                        defaultValue="b"
                    >
                        <div rdxFieldItem>
                            <span data-radio-node="a" rdxRadioItem value="a">
                                <span
                                    class="audit-radio-indicator"
                                    *rdxRadioIndicatorPresence="{ keepMounted: true }"
                                    data-radio-node="dot-a"
                                    rdxRadioIndicator
                                ></span>
                                <input data-radio-node="input-a" rdxRadioItemInput />
                            </span>
                            <label data-radio-node="label-a" rdxFieldLabel>Alpha</label>
                        </div>
                        <div rdxFieldItem>
                            <span data-radio-node="b" rdxRadioItem value="b">
                                <span
                                    class="audit-radio-indicator"
                                    *rdxRadioIndicatorPresence
                                    data-radio-node="dot-b"
                                    rdxRadioIndicator
                                ></span>
                                <input data-radio-node="input-b" rdxRadioItemInput />
                            </span>
                            <label data-radio-node="label-b" rdxFieldLabel>Beta</label>
                        </div>
                    </div>
                </div>
            </fieldset>
            <output>{{ requests() }}</output>
        </form>
    `
})
export class RadioAuditView {
    protected readonly requests = signal(0);
    protected readonly increment = (count: number) => count + 1;
}
