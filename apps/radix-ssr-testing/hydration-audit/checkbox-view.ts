import { isPlatformBrowser } from '@angular/common';
import { Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxFieldDescription, RdxFieldItem, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

@Component({
    selector: 'audit-checkbox-view',
    imports: [
        RdxCheckboxButtonDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxRootDirective,
        RdxFieldDescription,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot
    ],
    host: {
        '[attr.data-checkbox-audit]': 'name()',
        '[attr.data-client]': 'browser ? "" : undefined',
        '[attr.data-checkbox-requests]': 'requests()'
    },
    template: `
        <form>
            <div rdxFieldRoot name="features">
                <label rdxFieldLabel data-checkbox-node="group-label">Features</label>
                <p rdxFieldDescription data-checkbox-node="description">Select the features to enable.</p>
                <div [allValues]="values" [defaultValue]="initial" (onValueChange)="countRequest()" rdxCheckboxGroup>
                    <div rdxCheckboxRoot parent>
                        <button rdxCheckboxButton aria-label="All" data-checkbox-node="parent">All</button>
                        <input rdxCheckboxInput />
                    </div>
                    @for (value of values; track value) {
                        <div rdxFieldItem>
                            <label [attr.data-checkbox-node]="'label-' + value" rdxFieldLabel>Option {{ value }}</label>
                            <div [value]="value" rdxCheckboxRoot>
                                <button [attr.data-checkbox-node]="value" rdxCheckboxButton>
                                    {{ value }}
                                    <span
                                        *rdxCheckboxIndicatorPresence
                                        [attr.data-checkbox-indicator]="value"
                                        rdxCheckboxIndicator
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </span>
                                </button>
                                <input [attr.data-checkbox-node]="'input-' + value" rdxCheckboxInput />
                            </div>
                        </div>
                    }
                </div>
            </div>
        </form>
    `
})
export class CheckboxAuditView {
    readonly name = input.required<string>();
    protected readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    protected readonly requests = signal(0);
    protected readonly values = ['a', 'b'];
    protected readonly initial = ['a'];

    protected countRequest(): void {
        this.requests.update((requests) => requests + 1);
    }
}
