import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxStepperIndicatorDirective } from '../src/stepper-indicator.directive';
import { RdxStepperItemDirective } from '../src/stepper-item.directive';
import { RdxStepperRootDirective } from '../src/stepper-root.directive';
import { RdxStepperSeparatorDirective } from '../src/stepper-separator.directive';
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
                RdxStepperIndicatorDirective,
                RdxStepperSeparatorDirective
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

                        .StepperList {
                            display: flex;
                            gap: 1rem;
                            max-width: 32rem;
                            width: 100%;
                        }

                        .StepperItem {
                            display: flex;
                            gap: 0.5rem;
                            align-items: center;
                            position: relative;
                            padding-left: 1rem;
                            padding-right: 1rem;
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

                        .StepperItemText {
                            position: absolute;
                            text-align: center;
                            top: 100%;
                            left: 0;
                            width: 100%;
                            margin-top: 0.5rem;
                            color: #57534e;
                        }

                        .StepperTitle {
                            font-size: 0.875rem;
                            font-weight: 500;
                            color: white;
                        }

                        .StepperDescription {
                            font-size: 0.75rem;
                            color: white;
                        }

                        .StepperSeparator {
                            width: 100%;
                            height: 1px;
                            left: calc(50% + 30px);
                            right: calc(-50% + 20px);
                            flex-shrink: 0;
                            background-color: var(--green-5);
                        }

                        .StepperTrigger {
                            display: flex;
                            cursor: pointer;
                            gap: 0.5rem;
                            width: 2.5rem;
                            height: 2.5rem;
                            align-items: center;
                            justify-content: center;
                        }

                        .StepperTrigger:focus {
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
            <div style="height: 200px;">
                <div rdxStepperRoot [value]="2" class="StepperList">
                    @for (item of steps; track $index) {
                        <div rdxStepperItem [step]="item.step" class="StepperItem">
                            <button rdxStepperTrigger class="StepperTrigger">
                                <div rdxStepperIndicator class="StepperIndicator"></div>
                            </button>
                            <div class="StepperItemText">
                                <h4 class="StepperTitle">
                                   {{ item.title }}
                                </h4>
                                <p class="StepperDescription">
                                   {{ item.description }}
                                </p>
                            </div>
                            @if (item.step !== steps[steps.length - 1].step) {
                                <div rdxStepperSeparator class="StepperSeparator"></div>
                            }
                        </div>
                    }
                </div>
            </div>
        `
    })
};
