import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxLabelDirective } from '../../label';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '../../roving-focus';
import { demoRadio } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxRadioIndicatorDirective } from '../src/radio-indicator.directive';
import { RdxRadioItemDirective } from '../src/radio-item.directive';
import { RdxRadioGroupDirective } from '../src/radio-root.directive';
import { RadioGroupComponent } from './radio-group.component';

import templateDrivenFormsSource from './radio-group.component?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

const html = String.raw;

export default {
    title: 'Primitives/Radio Group',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelDirective,
                RdxRadioItemDirective,
                RdxRadioIndicatorDirective,
                RdxRadioGroupDirective,
                RdxRovingFocusGroupDirective,
                RdxRovingFocusItemDirective,
                RadioGroupComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        props: { r: demoRadio },
        template: html`
            <form>
                <div [class]="r.group" rdxRadioRoot name="density" orientation="vertical" aria-label="View density">
                    <label [class]="r.row" rdxLabel>
                        <span [class]="r.item" rdxRadioItem value="default">
                            <span [class]="r.indicator" rdxRadioIndicator></span>
                        </span>
                        <span [class]="r.label">Default</span>
                    </label>
                    <label [class]="r.row" rdxLabel>
                        <span [class]="r.item" rdxRadioItem value="comfortable">
                            <span [class]="r.indicator" rdxRadioIndicator></span>
                        </span>
                        <span [class]="r.label">Comfortable</span>
                    </label>
                    <label [class]="r.row" rdxLabel>
                        <span [class]="r.item" rdxRadioItem value="compact">
                            <span [class]="r.indicator" rdxRadioIndicator></span>
                        </span>
                        <span [class]="r.label">Compact</span>
                    </label>
                </div>
            </form>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        props: { r: demoRadio },
        template: html`
            <div
                [class]="r.group"
                rdxRadioRoot
                [value]="'comfortable'"
                name="density-disabled"
                disabled
                orientation="vertical"
                aria-label="View density"
            >
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="default">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Default</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="comfortable">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Comfortable</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="compact">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Compact</span>
                </label>
            </div>
        `
    })
};

export const TemplateDrivenForms: Story = {
    parameters: source(templateDrivenFormsSource),
    render: () => ({
        template: html`
            <radio-groups-forms-example />
        `
    })
};
