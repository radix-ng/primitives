import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxLabelDirective } from '../../label';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxSwitchInputDirective } from '../src/switch-input.directive';
import { RdxSwitchRootDirective } from '../src/switch-root.directive';
import { RdxSwitchThumbDirective } from '../src/switch-thumb.directive';
import { SwitchReactiveForms } from './switch-forms.component';

const html = String.raw;

export default {
    title: 'Primitives/Switch',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelDirective,
                RdxSwitchRootDirective,
                RdxSwitchInputDirective,
                RdxSwitchThumbDirective,
                SwitchReactiveForms
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <label class="text-foreground flex items-center gap-3 text-sm font-medium" rdxLabel htmlFor="airplane-mode">
                Airplane mode
                <button
                    class="bg-muted data-[state=checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="airplane-mode"
                    rdxSwitchRoot
                    defaultChecked
                >
                    <span
                        class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </label>
        `
    })
};

export const Preselection: Story = {
    argTypes: {
        checked: {
            control: {
                type: 'boolean'
            }
        }
    },
    args: {
        checked: true
    },
    render: (args) => ({
        props: {
            config: args
        },
        template: html`
            <label
                class="text-foreground flex items-center gap-3 text-sm font-medium"
                rdxLabel
                htmlFor="airplane-mode-model"
            >
                Airplane mode
                <button
                    class="bg-muted data-[state=checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="airplane-mode-model"
                    rdxSwitchRoot
                    [checked]="config.checked"
                >
                    <input rdxSwitchInput />
                    <span
                        class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </label>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <label
                class="text-foreground flex items-center gap-3 text-sm font-medium"
                rdxLabel
                htmlFor="airplane-mode-disabled"
            >
                Airplane mode
                <button
                    class="bg-muted data-[state=checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="airplane-mode-disabled"
                    rdxSwitchRoot
                    disabled
                >
                    <input rdxSwitchInput />
                    <span
                        class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </label>
        `
    })
};

export const ReactiveForm: Story = {
    render: () => ({
        template: html`
            <switch-reactive-forms />
        `
    })
};
