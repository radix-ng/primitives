import { cn } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressLabelDirective } from '../src/progress-label.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';
import { RdxProgressTrackDirective } from '../src/progress-track.directive';
import { RdxProgressValueDirective } from '../src/progress-value.directive';
import { ProgressCircularComponent } from './progress-circular';
import circularSource from './progress-circular?raw';
import { ProgressLinearComponent } from './progress-linear';
import linearSource from './progress-linear?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Progress',
    decorators: [
        moduleMetadata({
            imports: [
                RdxProgressRootDirective,
                RdxProgressLabelDirective,
                RdxProgressValueDirective,
                RdxProgressTrackDirective,
                RdxProgressIndicatorDirective,
                ProgressCircularComponent,
                ProgressLinearComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

const progressClasses = {
    root: 'flex w-80 flex-col gap-2',
    header: 'flex items-center justify-between gap-4',
    label: 'text-sm font-medium text-foreground',
    value: 'text-sm tabular-nums text-muted-foreground',
    track: 'h-3 overflow-hidden rounded-full bg-muted',
    indicator: cn(
        'h-full rounded-full bg-primary transition-transform duration-500 ease-out',
        'data-[indeterminate]:animate-pulse data-[indeterminate]:rounded-none'
    )
};

export const Default: Story = {
    parameters: source(linearSource),
    render: () => ({
        template: html`
            <progress-linear />
        `
    })
};

export const Indeterminate: Story = {
    render: () => ({
        props: { c: progressClasses, cn },
        template: html`
            <div [value]="null" [class]="c.root" rdxProgressRoot>
                <div [class]="c.header">
                    <span [class]="c.label" rdxProgressLabel>Preparing upload</span>
                    <span [class]="c.value" rdxProgressValue></span>
                </div>

                <div [class]="c.track" rdxProgressTrack>
                    <div [class]="cn(c.indicator, 'w-1/3')" rdxProgressIndicator></div>
                </div>
            </div>
        `
    })
};

export const CustomRange: Story = {
    render: () => ({
        props: {
            value: 750,
            min: 500,
            max: 1000,
            c: progressClasses,
            cn,
            valueLabel: (value: number, min: number, max: number) => `${value - min} of ${max - min} MB`
        },
        template: html`
            <div [value]="value" [min]="min" [max]="max" [valueLabel]="valueLabel" [class]="c.root" rdxProgressRoot>
                <div [class]="c.header">
                    <span [class]="c.label" rdxProgressLabel>Transfer</span>
                    <span [class]="c.value" rdxProgressValue></span>
                </div>

                <div [class]="c.track" rdxProgressTrack>
                    <div [class]="cn(c.indicator, 'w-1/2')" rdxProgressIndicator></div>
                </div>
            </div>
        `
    })
};

export const Circular: Story = {
    parameters: source(circularSource),
    render: () => ({
        template: html`
            <progress-circular />
        `
    })
};
