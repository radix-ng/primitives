import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';

export default {
    title: 'Primitives/Collapsible',
    decorators: [
        moduleMetadata({
            imports: [
                RdxCollapsibleRootDirective,
                RdxCollapsibleTriggerDirective,
                RdxCollapsibleContentDirective
            ]
        }),
        componentWrapperDecorator(
            (story) => `
                <div class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>

                <style>
                    .CollapsibleRoot {
                        width: 300px;
                    }

                    .IconButton {
                        font-family: inherit;
                        border-radius: 100%;
                        height: 25px;
                        width: 25px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--violet-11);
                        box-shadow: 0 2px 10px var(--black-a7);
                    }

                    .Text {
                        color: var(--violet-11);
                        font-size: 15px;
                        line-height: 25px;
                    }

                    .Repository {
                        background-color: white;
                        border-radius: 4px;
                        margin: 10px 0;
                        padding: 10px;
                        box-shadow: 0 2px 10px var(--black-a7);
                    }
                </style>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
            <div class="CollapsibleRoot" CollapsibleRoot [open]="true">

                <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="Text" style="color: white">&#64;peduarte starred 3 repositories</span>
                <button class="IconButton" CollapsibleTrigger></button>
                </div>

                <div class="Repository">
                    <span class="Text">&#64;radix-ui/primitives</span>
                </div>

                <div CollapsibleContent>
                    <div class="Repository">
                        <span class="Text">&#64;radix-ui/colors</span>
                    </div>
                    <div class="Repository">
                        <span class="Text">&#64;stitches/react</span>
                    </div>
                </div>
            </div>
        `
    })
};
