import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { BADGE } from '../../.storybook/helpers/bages-config';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixCheck } from '@ng-icons/radix-icons';
import { LabelDirective } from '../../label';
import { CheckboxDirective } from '../src/checkbox.directive';
import { CheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';

export default {
    title: 'Primitives/Checkbox',
    parameters: {
        badges: [BADGE.SOON]
    },
    decorators: [
        moduleMetadata({
            imports: [
                LabelDirective,
                CheckboxDirective,
                CheckboxIndicatorDirective,
                NgIconComponent
            ],
            providers: [provideIcons({ radixCheck })]
        })
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
<div style="display: flex; align-items: center;">
    <button class="CheckboxRoot" rdxCheckbox id="r1" [(checked)]="checked">
        <ng-icon rdxCheckboxIndicator class="CheckboxIndicator" name="radixCheck"></ng-icon>
    </button>
    <label rdxLabel htmlFor="r1" class="Label">Check Item</label>
</div>

<style>
button {
    all: unset;
}

.CheckboxRoot {
    background-color: white;
    width: 25px;
    height: 25px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px color(display-p3 0 0 0 / 0.5);
}
.CheckboxRoot:hover {
    background-color: color(display-p3 0.953 0.943 0.993);
}
.CheckboxRoot:focus {
    box-shadow: 0 0 0 2px black;
}

.CheckboxIndicator {
    color: color(display-p3 0.383 0.317 0.702);
}

.CheckboxIndicator[data-state='unchecked'] {
    display: none;
}

.Label {
    color: white;
    padding-left: 15px;
    font-size: 15px;
    line-height: 1;
}
</style>
`
    })
};
