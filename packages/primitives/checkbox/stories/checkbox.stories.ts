import { argsToTemplate, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { expect } from 'storybook/test';
import { RdxLabelDirective } from '../../label';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';
import { CheckboxReactiveFormsExampleComponent } from './checkbox-forms';
import { CheckboxIndeterminate } from './checkbox-indeterminate';
import { CheckboxPresence } from './checkbox-presence';

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
                CheckboxReactiveFormsExampleComponent,
                CheckboxIndeterminate,
                CheckboxPresence
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
    args: {
        readonly: false,
        disabled: false
    },

    render: (args) => ({
        props: args,
        template: html`
            <div style="display: flex; align-items: center;">
                <div rdxCheckboxRoot ${argsToTemplate(args)} [checked]="true">
                    <button class="CheckboxButton" id="checkbox-1" rdxCheckboxButton>
                        <lucide-angular class="CheckboxIndicator" rdxCheckboxIndicator size="16" name="check" />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="Label" rdxLabel htmlFor="checkbox-1">Accept terms and conditions.</label>
            </div>
        `
    }),
    play: async ({ canvas }) => {
        await expect(canvas.getByText(/Accept terms and conditions/gi)).toBeTruthy();
    }
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

export const Presence: Story = {
    render: () => ({
        template: html`
            <checkbox-presence-example />
        `
    })
};
