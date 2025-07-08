import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxVisuallyHiddenInputBubbleDirective } from '../src/visually-hidden-input-bubble.directive';
import { RdxVisuallyHiddenInputDirective } from '../src/visually-hidden-input.directive';
import { RdxVisuallyHiddenDirective } from '../src/visually-hidden.directive';

const html = String.raw;

export default {
    title: 'Utilities/Visually Hidden',
    decorators: [
        moduleMetadata({
            imports: [
                RdxVisuallyHiddenDirective,
                RdxVisuallyHiddenInputBubbleDirective,
                RdxVisuallyHiddenInputDirective
            ]
        }),
        componentWrapperDecorator(
            (story) =>
                `
                    <div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <div>
                <div>
                    <label class="Label" for="visibleInput">Visible Input:</label>
                    <input class="Input" id="visibleInput" type="text" name="visibleInput" value="Visible Input" />
                </div>

                <div>
                    <label for="hiddenInput">Hidden Input:</label>
                    <input
                        rdxVisuallyHiddenInput
                        [feature]="'fully-hidden'"
                        [name]="'hiddenInput'"
                        [value]="'Hidden Value'"
                        [checked]="true"
                        [required]="true"
                        [disabled]="false"
                    />
                </div>

                <input
                    rdxVisuallyHiddenInput
                    [feature]="'fully-hidden'"
                    [name]="'testInput'"
                    [value]="{ key1: 'value1', key2: 'value2' }"
                    [checked]="true"
                    [required]="true"
                />
                <p>The input above is visually hidden but still interactable.</p>
            </div>

            <style>
                p {
                    color: white;
                    font-size: 15px;
                }

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
            </style>
        `
    })
};
