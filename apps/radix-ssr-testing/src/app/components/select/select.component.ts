import { Component } from '@angular/core';
import {
    RdxSelectComponent,
    RdxSelectContentDirective,
    RdxSelectIconDirective,
    RdxSelectItemDirective,
    RdxSelectItemIndicatorDirective,
    RdxSelectTriggerDirective,
    RdxSelectValueDirective
} from '@radix-ng/primitives/select';

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [
        RdxSelectComponent,
        RdxSelectItemIndicatorDirective,
        RdxSelectItemDirective,
        RdxSelectContentDirective,
        RdxSelectTriggerDirective,
        RdxSelectValueDirective,
        RdxSelectIconDirective
    ],
    template: `
        <span [defaultValue]="'1'" rdxSelect>
            <button rdxSelectTrigger>
                <span rdxSelectValue></span>
                <span rdxSelectIcon>▼</span>
            </button>
            <div rdxSelectContent>
                <div [value]="'1'" rdxSelectItem>
                    <span>Item 1</span>
                    <span rdxSelectItemIndicator>✔</span>
                </div>
                <div [value]="'2'" rdxSelectItem>
                    <span>Item 2</span>
                    <span rdxSelectItemIndicator>✔</span>
                </div>
                <div [value]="'3'" rdxSelectItem>
                    <span>Item 3</span>
                    <span rdxSelectItemIndicator>✔</span>
                </div>
            </div>
        </span>
    `
})
export default class SelectComponent {}
