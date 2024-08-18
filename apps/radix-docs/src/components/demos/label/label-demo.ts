import { Component } from '@angular/core';

import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    standalone: true,
    imports: [RdxLabelDirective],
    template: `
        <label rdxLabel htmlFor="uniqId">First Name</label>
        <input class="Input" id="uniqId" type="text" />
    `,
    styles: `
        input {
            all: unset;
        }

        .Input {
            width: 200px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            padding: 0 10px;
            margin-left: 10px;
            height: 35px;
            font-size: 15px;
            line-height: 1;
            color: white;
            background-color: var(--black-a5);
            box-shadow: 0 0 0 1px var(--black-a9);
        }

        .Input:focus {
            box-shadow: 0 0 0 2px black;
        }
        .Input::selection {
            background-color: var(--black-a9);
            color: white;
        }

        label {
            color: white;
            font-size: 15px;
            line-height: 35px;
            font-weight: 500;
        }
    `
})
export class LabelDemoComponent {}

export default LabelDemoComponent;
