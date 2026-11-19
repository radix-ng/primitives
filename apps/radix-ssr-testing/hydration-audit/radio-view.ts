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
import { RdxPortal } from '@radix-ng/primitives/portal';
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
        RdxFieldError,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxFieldsetLegend,
        RdxFieldsetRoot,
        RdxFormRoot,
        RdxPortal,
        RdxRadioGroupDirective,
        RdxRadioIndicatorDirective,
        RdxRadioIndicatorPresenceDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective
    ],
    template: `
        <form
            [attr.data-radio-group-ref]="groupRef()"
            [attr.data-radio-item-ref]="itemRef()"
            [attr.data-radio-submits]="submits()"
            [attr.data-radio-submit-value]="submitValue()"
            (onFormSubmit)="recordSubmit($event)"
            data-radio-audit
            rdxFormRoot
        >
            <fieldset #fieldset rdxFieldsetRoot>
                <legend data-radio-node="legend" rdxFieldsetLegend>Plan</legend>
                <div [container]="portaled() ? outside : fieldset" rdxPortal rdxFieldRoot name="plan">
                    <p rdxFieldDescription>Choose one plan.</p>
                    <div
                        #group="rdxRadioRoot"
                        [inputRef]="setGroupRef"
                        (onValueChange)="requests.update(increment)"
                        data-radio-node="group"
                        rdxRadioRoot
                        defaultValue="b"
                        required
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
                            <span [inputRef]="setItemRef" data-radio-node="b" rdxRadioItem value="b">
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
                    <p data-radio-required-error rdxFieldError match="valueMissing">Choose one plan.</p>
                </div>
            </fieldset>
            <button (click)="group.value.set(null)" type="button" data-radio-clear>Clear plan</button>
            <button (click)="portaled.set(true)" type="button" data-radio-move>Move plan outside</button>
            <button type="submit" data-radio-submit>Submit plan</button>
            <output>{{ requests() }}</output>
        </form>
        <div #outside data-radio-portal></div>
    `
})
export class RadioAuditView {
    protected readonly groupRef = signal<string | null>(null);
    protected readonly itemRef = signal<string | null>(null);
    protected readonly setGroupRef = (input: HTMLInputElement | null) => this.groupRef.set(input?.id ?? null);
    protected readonly setItemRef = (input: HTMLInputElement | null) => this.itemRef.set(input?.id ?? null);
    protected readonly requests = signal(0);
    protected readonly submits = signal(0);
    protected readonly submitValue = signal<string | null>(null);
    protected readonly portaled = signal(false);
    protected readonly increment = (count: number) => count + 1;

    protected recordSubmit({ values }: RdxFormSubmitEvent): void {
        this.submitValue.set(String(values['plan']));
        this.submits.update(this.increment);
    }
}
