import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { cn } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxMeterIndicatorDirective } from '../src/meter-indicator.directive';
import { RdxMeterLabelDirective } from '../src/meter-label.directive';
import { RdxMeterRootDirective } from '../src/meter-root.directive';
import { RdxMeterTrackDirective } from '../src/meter-track.directive';
import { RdxMeterValueDirective } from '../src/meter-value.directive';
import { MeterStorageComponent } from './meter';
import storageSource from './meter?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Meter',
    decorators: [
        moduleMetadata({
            imports: [
                RdxMeterRootDirective,
                RdxMeterLabelDirective,
                RdxMeterValueDirective,
                RdxMeterTrackDirective,
                RdxMeterIndicatorDirective,
                MeterStorageComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

const meterClasses = {
    root: 'flex w-80 flex-col gap-2',
    header: 'flex items-center justify-between gap-4',
    label: 'text-sm font-medium text-foreground',
    value: 'text-sm tabular-nums text-muted-foreground',
    track: 'h-3 overflow-hidden rounded-full bg-muted',
    indicator: 'h-full rounded-full bg-primary transition-all duration-500 ease-out'
};

export const Default: Story = {
    parameters: source(storageSource),
    render: () => ({
        template: html`
            <meter-storage />
        `
    })
};

export const CustomRange: Story = {
    render: () => ({
        props: {
            value: 72,
            min: 50,
            max: 100,
            format: { style: 'unit', unit: 'liter', unitDisplay: 'short' } satisfies Intl.NumberFormatOptions,
            getAriaValueText: (formattedValue: string) => `${formattedValue} in the tank`,
            c: meterClasses,
            cn
        },
        template: html`
            <div
                [value]="value"
                [min]="min"
                [max]="max"
                [format]="format"
                [getAriaValueText]="getAriaValueText"
                [class]="c.root"
                rdxMeterRoot
            >
                <div [class]="c.header">
                    <span [class]="c.label" rdxMeterLabel>Fuel level</span>
                    <span [class]="c.value" rdxMeterValue></span>
                </div>

                <div [class]="c.track" rdxMeterTrack>
                    <div [class]="cn(c.indicator, 'w-[44%]')" rdxMeterIndicator></div>
                </div>
            </div>
        `
    })
};

export const AriaValueText: Story = {
    render: () => ({
        props: {
            value: 88,
            ariaValueText: 'Memory pressure is high',
            c: meterClasses,
            cn
        },
        template: html`
            <div [value]="value" [aria-valuetext]="ariaValueText" [class]="c.root" rdxMeterRoot>
                <div [class]="c.header">
                    <span [class]="c.label" rdxMeterLabel>Memory pressure</span>
                    <span [class]="c.value" rdxMeterValue></span>
                </div>

                <div [class]="c.track" rdxMeterTrack>
                    <div [class]="cn(c.indicator, 'w-[88%]', 'bg-destructive')" rdxMeterIndicator></div>
                </div>
            </div>
        `
    })
};
