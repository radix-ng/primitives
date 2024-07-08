import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Check, Dot, LucideAngularModule } from 'lucide-angular';

import { RdxLabelRootDirective } from '../../label';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';
import { CheckboxReactiveFormsExampleComponent } from './checkbox-group.component';

export default {
    title: 'Primitives/Checkbox',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelRootDirective,
                RdxCheckboxDirective,
                RdxCheckboxIndicatorDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Check }),
                CheckboxReactiveFormsExampleComponent
            ]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme radix-themes-default-fonts"
                      data-accent-color="indigo"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
<form>
    <div style="display: flex; align-items: center;">
        <button class="CheckboxRoot" rdxCheckbox id="r1" [(checked)]="checked">
            <lucide-angular rdxCheckboxIndicator class="CheckboxIndicator" size="16" name="check"></lucide-angular>
            <input type="checkbox" aria-hidden="true" tabindex="-1" value="on" rdxCheckboxIndicator
            style="transform: translateX(-100%); position: absolute; pointer-events: none; opacity: 0; margin: 0; width: 25px; height: 25px;"/>
        </button>
        <label LabelRoot htmlFor="r1" class="Label">Check Item</label>
    </div>
</form>

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
    box-shadow: 0 2px 10px var(--black-a7);
}
.CheckboxRoot:hover {
    background-color: var(--violet-3);
}
.CheckboxRoot:focus {
    box-shadow: 0 0 0 2px black;
}

.CheckboxIndicator {
    align-items: center;
    display: flex;
    color: var(--violet-11);
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

export const CheckboxGroup: Story = {
    render: () => ({
        template: `

<checkbox-groups-forms-example></checkbox-groups-forms-example>

`
    })
};
