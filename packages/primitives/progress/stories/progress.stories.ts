import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';

const html = String.raw;

export default {
    title: 'Primitives/Progress',
    decorators: [
        moduleMetadata({
            imports: [RdxProgressRootDirective, RdxProgressIndicatorDirective]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">${story}</div>
            `
        )
    ],
    argTypes: {
        progress: {
            options: ['10', '30', '70', '95'],
            control: { type: 'select' }
        }
    }
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        progress: 70
    },
    render: (args) => ({
        props: args,
        template: html`
            <div class="ProgressRoot" rdxProgressRoot [value]="progress">
                <div
                    class="ProgressIndicator"
                    rdxProgressIndicator
                    [style.transform]="'translateX(-' + (100 - progress) +'%)'"
                ></div>
            </div>

            <style>
                .ProgressRoot {
                    position: relative;
                    overflow: hidden;
                    background: var(--black-a9);
                    border-radius: 99999px;
                    width: 300px;
                    height: 25px;

                    /* Fix overflow clipping in Safari */
                    /* https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0 */
                    transform: translateZ(0);
                }

                .ProgressIndicator {
                    background-color: white;
                    width: 100%;
                    height: 100%;
                    transition: transform 660ms cubic-bezier(0.65, 0, 0.35, 1);
                }
            </style>
        `
    })
};
