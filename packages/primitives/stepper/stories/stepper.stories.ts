import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxStepperIndicatorDirective } from '../src/stepper-indicator.directive';
import { RdxStepperItemDirective } from '../src/stepper-item.directive';
import { RdxStepperRootDirective } from '../src/stepper-root.directive';
import { RdxStepperTriggerDirective } from '../src/stepper-trigger.directive';

const html = String.raw;

export default {
    title: 'Primitives/Stepper',
    decorators: [
        moduleMetadata({
            imports: [
                RdxStepperRootDirective,
                RdxStepperItemDirective,
                RdxStepperTriggerDirective,
                RdxStepperIndicatorDirective
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        .StepperList {
                            display: flex;
                            gap: 1rem;
                        }

                        .StepperItem {
                            display: flex;
                            gap: 1rem;
                            align-items: center;
                            cursor: pointer;
                        }

                        .StepperItem[data-disabled] {
                            pointer-events: none;
                        }

                        .StepperItem[data-disabled] .StepperIndicator {
                            color: #9ca3af;
                        }

                        .StepperItem[data-state='active'] .StepperIndicator {
                            background-color: #000;
                            color: #fff;
                            box-shadow: 0 0 0 2px #000;
                        }

                        .StepperItem[data-state='completed'] .StepperIndicator {
                            background-color: var(--green-9);
                            color: #fff;
                            box-shadow: 0 0 0 2px var(--green-9);
                        }

                        .StepperIndicator {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 9999px;
                            width: 1.5rem;
                            height: 1.5rem;
                            color: var(--grass-11);
                            box-shadow: 0 0 0 2px #000;
                        }

                        .StepperTitle {
                            font-size: 0.875rem;
                            font-weight: 500;
                            color: #000;
                        }

                        .StepperDescription {
                            font-size: 0.75rem;
                            color: #000;
                        }

                        .StepperTrigger {
                            display: flex;
                            flex-direction: column;
                            gap: 0.5rem;
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
        props: {
            steps: [
                {
                    step: 1,
                    title: 'Address',
                    description: 'Add your address here',
                    icon: 'radix-icons:home'
                },
                {
                    step: 2,
                    title: 'Shipping',
                    description: 'Set your preferred shipping method',
                    icon: 'radix-icons:archive'
                },
                {
                    step: 3,
                    title: 'Trade-in',
                    description: 'Add any trade-in items you have',
                    icon: 'radix-icons:update'
                },
                {
                    step: 4,
                    title: 'Payment',
                    description: 'Add any payment information you have',
                    icon: 'radix-icons:sketch-logo'
                },
                {
                    step: 5,
                    title: 'Checkout',
                    description: 'Confirm your order',
                    icon: 'radix-icons:check'
                }
            ]
        },
        template: `
            <div rdxStepperRoot [value]="2" class="StepperList">
                @for (item of steps; track $index) {
                    <div rdxStepperItem [step]="item.step" class="StepperItem">
                        <button rdxStepperTrigger class="StepperTrigger">
                            <div rdxStepperIndicator class="StepperIndicator"></div>
                            <div class="StepperItemText">
                              <h4 class="StepperTitle">
                                {{ item.title }}
                              </h4>
                              <p class="StepperDescription">
                                {{ item.description }}
                              </p>
                            </div>
                        </button>
                    </div>
                }
            </div>
        `
    })
};
