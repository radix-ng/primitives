import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxStepperIndicatorDirective } from '../src/stepper-indicator.directive';
import { RdxStepperItemDirective } from '../src/stepper-item.directive';
import { RdxStepperRootDirective } from '../src/stepper-root.directive';
import { RdxStepperSeparatorDirective } from '../src/stepper-separator.directive';
import { RdxStepperTriggerDirective } from '../src/stepper-trigger.directive';
import { StepperNavigationComponent } from './stepper-navigation.component';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

export default {
    title: 'Primitives/Stepper',
    decorators: [
        moduleMetadata({
            imports: [
                RdxStepperRootDirective,
                RdxStepperItemDirective,
                RdxStepperTriggerDirective,
                RdxStepperIndicatorDirective,
                RdxStepperSeparatorDirective,
                StepperNavigationComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

const steps = [
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
];

export const Default: Story = {
    render: () => ({
        props: {
            steps: steps
        },
        template: `
            <div rdxStepperRoot [value]="2" class="flex w-full max-w-xl gap-4">
                @for (item of steps; track $index) {
                    <div
                        rdxStepperItem
                        [step]="item.step"
                        class="group relative flex flex-1 flex-col items-center px-4 data-[disabled]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                    >
                        @if (item.step !== steps[steps.length - 1].step) {
                            <div
                                rdxStepperSeparator
                                class="bg-border absolute top-[21px] right-[calc(-50%+20px)] left-[calc(50%+30px)] h-px"
                            ></div>
                        }
                        <button
                            rdxStepperTrigger
                            class="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-full focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)]"
                        >
                            <div
                                rdxStepperIndicator
                                class="bg-background text-foreground group-data-[state=inactive]:bg-muted group-data-[state=inactive]:text-muted-foreground group-data-[state=active]:bg-foreground group-data-[state=active]:text-background group-data-[state=completed]:bg-primary group-data-[state=completed]:text-primary-foreground inline-flex h-6 w-6 items-center justify-center rounded-full [box-shadow:0_0_0_2px_var(--border)] group-data-[state=active]:[box-shadow:0_0_0_2px_var(--foreground)] group-data-[state=completed]:[box-shadow:0_0_0_2px_var(--primary)]"
                            >
                                {{$index+1}}
                            </div>
                        </button>
                        <div class="text-muted-foreground mt-2 w-full text-center">
                            <h4 class="text-foreground text-sm font-medium">
                               {{ item.title }}
                            </h4>
                            <p class="text-muted-foreground text-xs">
                               {{ item.description }}
                            </p>
                        </div>
                    </div>
                }
            </div>
        `
    })
};

export const Vertical: Story = {
    render: () => ({
        props: {
            steps: steps
        },
        template: `
            <div rdxStepperRoot [value]="2" orientation="vertical" class="flex w-full max-w-sm flex-col gap-5">
                @for (item of steps; track $index) {
                    <div
                        rdxStepperItem
                        [step]="item.step"
                        class="group relative flex items-start gap-3 data-[disabled]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                    >
                        @if (item.step !== steps[steps.length - 1].step) {
                            <div
                                rdxStepperSeparator
                                class="bg-border absolute top-10 -bottom-5 left-5 w-px -translate-x-1/2"
                            ></div>
                        }
                        <button
                            rdxStepperTrigger
                            class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)]"
                        >
                            <div
                                rdxStepperIndicator
                                class="bg-background text-foreground group-data-[state=inactive]:bg-muted group-data-[state=inactive]:text-muted-foreground group-data-[state=active]:bg-foreground group-data-[state=active]:text-background group-data-[state=completed]:bg-primary group-data-[state=completed]:text-primary-foreground inline-flex h-6 w-6 items-center justify-center rounded-full [box-shadow:0_0_0_2px_var(--border)] group-data-[state=active]:[box-shadow:0_0_0_2px_var(--foreground)] group-data-[state=completed]:[box-shadow:0_0_0_2px_var(--primary)]"
                            >
                                {{$index+1}}
                            </div>
                        </button>
                        <div class="text-muted-foreground mt-1 text-left">
                            <h4 class="text-foreground text-sm font-medium">
                               {{ item.title }}
                            </h4>
                            <p class="text-muted-foreground text-xs">
                               {{ item.description }}
                            </p>
                        </div>
                    </div>
                }
            </div>
        `
    })
};

export const Navigation: Story = {
    render: () => ({
        props: {
            steps: [1, 2, 3, 4]
        },
        template: `
            <StepperNavigation />
        `
    })
};
