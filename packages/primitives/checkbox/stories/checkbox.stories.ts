import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Check, LucideAngularModule, Minus } from 'lucide-angular';
import { RdxLabelDirective } from '../../label';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxInputDirective } from '../src/checkbox-input.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';
import { CheckboxReactiveFormsExampleComponent } from './checkbox-group.component';
import { CheckboxIndeterminateComponent } from './checkbox-indeterminate.component';

const html = String.raw;

export default {
    title: 'Primitives/Checkbox',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelDirective,
                RdxCheckboxDirective,
                RdxCheckboxIndicatorDirective,
                RdxCheckboxInputDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Check, Minus }),
                CheckboxReactiveFormsExampleComponent,
                CheckboxIndeterminateComponent
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-gray-color="slate"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <form>
                <div style="display: flex; align-items: center;">
                    <button class="CheckboxRoot" rdxCheckboxRoot [(checked)]="checked">
                        <lucide-angular
                            class="CheckboxIndicator"
                            rdxCheckboxIndicator
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input id="r1" rdxCheckboxInput type="checkbox" />
                    </button>
                    <label class="Label" rdxLabel htmlFor="r1">Check Item</label>
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
    name: 'With Reactive forms',
    render: () => ({
        template: html`
            <checkbox-groups-forms-example></checkbox-groups-forms-example>
        `
    })
};

export const indeterminate: Story = {
    render: () => ({
        template: html`
            <checkbox-indeterminate-example></checkbox-indeterminate-example>
        `
    })
};
