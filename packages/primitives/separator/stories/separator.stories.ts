import { CommonModule } from '@angular/common';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';
import { RdxSeparatorRootDirective } from '../src/separator.directive';

const html = String.raw;

export default {
    component: RdxSeparatorRootDirective,
    title: 'Primitives/Separator',
    decorators: [
        moduleMetadata({
            imports: [RdxSeparatorRootDirective, CommonModule]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">${story}</div>
            `
        )
    ]
};

export const Default = {
    render: () => ({
        template: html`
            <style>
                .SeparatorRoot {
                    background-color: var(--violet-6);
                }

                .SeparatorRoot[data-orientation='horizontal'] {
                    height: 1px;
                    width: 100%;
                }

                .SeparatorRoot[data-orientation='vertical'] {
                    height: 100%;
                    width: 1px;
                }

                .Text {
                    color: white;
                    font-size: 15px;
                    line-height: 20px;
                }
            </style>
            <div style="width: 100%; max-width: 300px; margin: 0 15px;">
                <div class="Text">Radix Primitives</div>
                <div class="Text" style="font-weight: 500;">An open-source UI component library.</div>
                <div class="SeparatorRoot" rdxSeparatorRoot style="margin: 15px 0;"></div>
                <div style="display: flex; height: 1.25rem; align-items: center;">
                    <div class="Text">Blog</div>
                    <div
                        class="SeparatorRoot"
                        rdxSeparatorRoot
                        decorative="decorative"
                        orientation="vertical"
                        style="margin: 0 15px;"
                    ></div>
                    <div class="Text">Docs</div>
                    <div
                        class="SeparatorRoot"
                        rdxSeparatorRoot
                        decorative="decorative"
                        orientation="vertical"
                        style="margin: 0 15px;"
                    ></div>
                    <div class="Text">Source</div>
                </div>
            </div>
        `
    })
};
