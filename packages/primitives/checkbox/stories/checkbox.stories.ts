import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { expect } from 'storybook/test';
import { RdxLabelDirective } from '../../label';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
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
        tailwindDemoDecorator()
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
            <div class="flex items-center gap-3">
                <div rdxCheckboxRoot ${argsToTemplate(args)} [checked]="true">
                    <button
                        class="border-border bg-background focus-visible:ring-ring flex size-6 items-center justify-center rounded-md border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="checkbox-1"
                        rdxCheckboxButton
                    >
                        <lucide-angular
                            class="text-primary flex items-center data-[state=unchecked]:hidden"
                            rdxCheckboxIndicator
                            size="16"
                            name="check"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="checkbox-1">
                    Accept terms and conditions.
                </label>
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
