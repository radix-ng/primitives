import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, UnfoldVertical, X } from 'lucide-angular';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';
import { RdxCollapsibleAnimationComponent } from './collapsible-animation.component';
import { RdxCollapsibleExternalTriggeringComponent } from './collapsible-external-triggering.component';

export default {
    title: 'Primitives/Collapsible',
    decorators: [
        moduleMetadata({
            imports: [
                RdxCollapsibleRootDirective,
                RdxCollapsibleTriggerDirective,
                RdxCollapsibleContentDirective,
                RdxCollapsibleExternalTriggeringComponent,
                RdxCollapsibleAnimationComponent,
                BrowserAnimationsModule,
                LucideAngularModule,
                LucideAngularModule.pick({ X, UnfoldVertical })
            ],
            providers: [provideAnimations()]
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
                    button {
                        all: unset;
                    }
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

                    .IconButton[data-state='closed'] {
                        background-color: white;
                    }

                    .IconButton[data-state='open'] {
                        background-color: var(--violet-3);
                    }

                    .IconButton:hover {
                        background-color: var(--violet-3);
                    }

                    .IconButton:focus {
                        box-shadow: 0 0 0 2px black;
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
            <div class="CollapsibleRoot" rdxCollapsibleRoot [open]="true" #collapsibleRoot="collapsibleRoot">

                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span class="Text" style="color: white">&#64;peduarte starred 3 repositories</span>
                    <button class="IconButton" rdxCollapsibleTrigger>
                        @if (collapsibleRoot.isOpen()) {
                            <lucide-angular size="16" name="x" style="display: flex;"></lucide-angular>
                        } @else {
                            <lucide-angular size="16" name="unfold-vertical" style="display: flex;"></lucide-angular>
                        }
                    </button>
                </div>

                <div class="Repository">
                    <span class="Text">&#64;radix-ui/primitives</span>
                </div>

                <div rdxCollapsibleContent>
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

export const ExternalTrigger: Story = {
    render: () => ({
        template: `
            <div class="radix-themes light light-theme radix-themes-default-fonts"
                data-accent-color="indigo"
                data-radius="medium"
                data-scaling="100%"
            >
                <rdx-collapsible-external-triggering></rdx-collapsible-external-triggering>
            </div>
        `
    })
};

export const Animation: Story = {
    render: () => ({
        template: `
            <div class="radix-themes light light-theme radix-themes-default-fonts"
                data-accent-color="indigo"
                data-radius="medium"
                data-scaling="100%"
            >
                <rdx-collapsible-animation></rdx-collapsible-animation>
            </div>
        `
    })
};
