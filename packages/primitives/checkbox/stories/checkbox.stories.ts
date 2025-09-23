import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Check, LucideAngularModule, Minus } from 'lucide-angular';
import { RdxLabelDirective } from '../../label';
import { RdxCheckboxRootDirective } from '../src/checkbox';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { CheckboxReactiveFormsExampleComponent } from './checkbox-forms';
import { CheckboxIndeterminate } from './checkbox-indeterminate';

const html = String.raw;

export default {
    title: 'Primitives/Checkbox',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelDirective,
                RdxCheckboxRootDirective,
                RdxCheckboxButtonDirective,
                RdxCheckboxIndicatorDirective,
                RdxCheckboxInputDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Check, Minus }),
                CheckboxReactiveFormsExampleComponent,
                CheckboxIndeterminate
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
            <div style="display: flex; align-items: center;">
                <div rdxCheckboxRoot>
                    <button class="CheckboxRoot" id="checkbox-1" rdxCheckboxButton>
                        <lucide-angular class="CheckboxIndicator" rdxCheckboxIndicator size="16" name="check" />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="Label" rdxLabel htmlFor="checkbox-1">Accept terms and conditions.</label>
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

export const ReactiveForms: Story = {
    render: () => ({
        template: html`
            <checkbox-groups-forms-example />
        `
    })
};

export const Indeterminate: Story = {
    render: () => ({
        template: html`
            <checkbox-indeterminate-example />
        `
    })
};
