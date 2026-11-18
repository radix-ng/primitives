import {
    LucideBold,
    LucideItalic,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
    LucideTextAlignStart,
    LucideUnderline
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroupWithoutFocus } from '@radix-ng/primitives/toggle-group';
import { RdxToolbarButton, RdxToolbarLink, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ToolbarDefaultStory } from './toolbar-default-example';
import defaultPortableSource from './toolbar-default-example?raw';
import { ToolbarDisabledStory } from './toolbar-disabled-example';
import disabledPortableSource from './toolbar-disabled-example?raw';
import { ToolbarVerticalStory } from './toolbar-vertical-example';
import verticalPortableSource from './toolbar-vertical-example?raw';
import { ToolbarWithMenuExample } from './toolbar-with-menu';
import menuSource from './toolbar-with-menu?raw';
import { ToolbarWithNumberFieldExample } from './toolbar-with-number-field';
import numberFieldSource from './toolbar-with-number-field?raw';
import { ToolbarWithTooltipExample } from './toolbar-with-tooltip';
import tooltipSource from './toolbar-with-tooltip?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Toolbar',
    decorators: [
        moduleMetadata({
            imports: [
                ToolbarDefaultStory,
                ToolbarVerticalStory,
                ToolbarDisabledStory,
                RdxToolbarRoot,
                RdxToolbarButton,
                RdxToolbarLink,
                RdxToolbarSeparator,
                RdxToggleGroupWithoutFocus,
                RdxToggle,
                ToolbarWithMenuExample,
                ToolbarWithTooltipExample,
                ToolbarWithNumberFieldExample,
                LucideBold,
                LucideItalic,
                LucideUnderline,
                LucideTextAlignStart,
                LucideTextAlignCenter,
                LucideTextAlignEnd
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultPortableSource),
    render: () => ({
        template: html`
            <rdx-toolbar-default-example />
        `
    })
};

export const Vertical: Story = {
    parameters: source(verticalPortableSource),
    render: () => ({
        template: html`
            <rdx-toolbar-vertical-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledPortableSource),
    render: () => ({
        template: html`
            <rdx-toolbar-disabled-example />
        `
    })
};

export const WithMenu: Story = {
    parameters: source(menuSource),
    render: () => ({
        template: html`
            <toolbar-with-menu />
        `
    })
};

export const WithTooltip: Story = {
    parameters: source(tooltipSource),
    render: () => ({
        template: html`
            <toolbar-with-tooltip />
        `
    })
};

export const WithNumberField: Story = {
    parameters: source(numberFieldSource),
    render: () => ({
        template: html`
            <toolbar-with-number-field />
        `
    })
};
