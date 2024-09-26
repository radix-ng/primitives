import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Italic, LucideAngularModule } from 'lucide-angular';
import { RdxToggleDirective } from '../src/toggle.directive';

const html = String.raw;

export default {
    title: 'Primitives/Toggle',
    decorators: [
        moduleMetadata({
            imports: [
                RdxToggleDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Italic })
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
                        .Toggle {
                            background-color: white;
                            color: var(--mauve-11);
                            height: 35px;
                            width: 35px;
                            border-radius: 4px;
                            display: flex;
                            font-size: 15px;
                            line-height: 1;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 2px 10px var(--black-a7);
                        }
                        .Toggle:hover {
                            background-color: var(--violet-3);
                        }
                        .Toggle[disabled] {
                            pointer-events: none;
                            opacity: 0.5;
                        }
                        .Toggle[data-state='on'] {
                            background-color: var(--violet-6);
                            color: var(--violet-12);
                        }
                        .Toggle:focus {
                            box-shadow: 0 0 0 2px black;
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
            <button class="Toggle" rdxToggle aria-label="Toggle italic">
                <lucide-angular name="italic" size="16"></lucide-angular>
            </button>
        `
    })
};

export const State: Story = {
    argTypes: {
        pressed: {
            control: 'boolean'
        },
        disabled: {
            control: 'boolean'
        }
    },
    render: (args) => ({
        props: {
            config: args
        },
        template: html`
            <button
                class="Toggle"
                rdxToggle
                [disabled]="config.disabled"
                [pressed]="config.pressed"
                aria-label="Toggle italic"
            >
                <lucide-angular name="italic" size="12"></lucide-angular>
            </button>
        `
    })
};
