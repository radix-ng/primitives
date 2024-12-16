import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxLabelDirective } from '../../label';
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
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        button {
                            all: unset;
                        }

                        .SwitchRoot {
                            width: 42px;
                            height: 25px;
                            background-color: var(--black-a9);
                            border-radius: 9999px;
                            margin-left: 15px;
                            position: relative;
                            box-shadow: 0 2px 10px var(--black-a7);
                            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                        }
                        .SwitchRoot:focus {
                            box-shadow: 0 0 0 2px black;
                        }
                        .SwitchRoot[data-state='checked'] {
                            background-color: black;
                        }
                        .SwitchRoot[data-disabled='true'] {
                            background-color: var(--black-a6);
                            cursor: not-allowed;
                            box-shadow: none;
                        }

                        .SwitchThumb {
                            display: block;
                            width: 21px;
                            height: 21px;
                            background-color: white;
                            border-radius: 9999px;
                            box-shadow: 0 2px 2px var(--black-a7);
                            transition: transform 100ms;
                            transform: translateX(2px);
                            will-change: transform;
                        }
                        .SwitchThumb[data-state='checked'] {
                            transform: translateX(19px);
                        }

                        .Label {
                            color: white;
                            font-size: 15px;
                            line-height: 1;
                            display: flex;
                            align-items: center;
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <label class="Label" rdxLabel htmlFor="airplane-mode">
                Airplane mode
                <button class="SwitchRoot" id="airplane-mode" rdxSwitchRoot [(checked)]="checked">
                    <span class="SwitchThumb" rdxSwitchThumb></span>
                </button>
            </label>
        `
    })
};

export const DefaultInput: Story = {
    name: 'With Input',
    render: () => ({
        template: html`
            <label class="Label" rdxLabel htmlFor="airplane-mode">
                Airplane mode
                <button class="SwitchRoot" id="airplane-mode" rdxSwitchRoot [(checked)]="checked">
                    <input rdxSwitchInput />
                    <span class="SwitchThumb" rdxSwitchThumb></span>
                </button>
            </label>
        `
    })
};

export const Disabled: Story = {
    name: 'Disabled',
    render: () => ({
        template: html`
            <label class="Label" rdxLabel htmlFor="airplane-mode-disabled">
                Airplane mode
                <button class="SwitchRoot" id="airplane-mode-disabled" rdxSwitchRoot disabled>
                    <input rdxSwitchInput />
                    <span class="SwitchThumb" rdxSwitchThumb></span>
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
