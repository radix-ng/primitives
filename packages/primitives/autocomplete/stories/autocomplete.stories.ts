import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { AutocompleteAsync } from './autocomplete-async';
import asyncSource from './autocomplete-async?raw';
import { AutocompleteAutoHighlight } from './autocomplete-auto-highlight';
import autoHighlightSource from './autocomplete-auto-highlight?raw';
import { AutocompleteCommandPalette } from './autocomplete-command-palette';
import commandPaletteSource from './autocomplete-command-palette?raw';
import { AutocompleteDefault } from './autocomplete-default';
import defaultSource from './autocomplete-default?raw';
import { AutocompleteDisabled } from './autocomplete-disabled';
import disabledSource from './autocomplete-disabled?raw';
import { AutocompleteFuzzy } from './autocomplete-fuzzy';
import fuzzySource from './autocomplete-fuzzy?raw';
import { AutocompleteGrid } from './autocomplete-grid';
import gridSource from './autocomplete-grid?raw';
import { AutocompleteGrouped } from './autocomplete-grouped';
import groupedSource from './autocomplete-grouped?raw';
import { AutocompleteInline } from './autocomplete-inline';
import inlineSource from './autocomplete-inline?raw';
import { AutocompleteLimit } from './autocomplete-limit';
import limitSource from './autocomplete-limit?raw';
import { AutocompleteReactiveForms } from './autocomplete-reactive-forms';
import reactiveFormsSource from './autocomplete-reactive-forms?raw';
import { AutocompleteTemplateForms } from './autocomplete-template-forms';
import templateFormsSource from './autocomplete-template-forms?raw';
import { AutocompleteValidation } from './autocomplete-validation';
import validationSource from './autocomplete-validation?raw';
import { AutocompleteVirtualizedExample } from './autocomplete-virtualized';
import virtualizedSource from './autocomplete-virtualized?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const source = (code: string) => ({
    docs: { source: { code, language: 'typescript' } }
});

export default {
    title: 'Primitives/Autocomplete',
    decorators: [
        moduleMetadata({
            imports: [
                AutocompleteDefault,
                AutocompleteInline,
                AutocompleteAutoHighlight,
                AutocompleteGrouped,
                AutocompleteLimit,
                AutocompleteFuzzy,
                AutocompleteAsync,
                AutocompleteCommandPalette,
                AutocompleteGrid,
                AutocompleteVirtualizedExample,
                AutocompleteReactiveForms,
                AutocompleteTemplateForms,
                AutocompleteValidation,
                AutocompleteDisabled
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <autocomplete-default />
        `
    })
};

export const InlineAutocompletion: Story = {
    parameters: source(inlineSource),
    render: () => ({
        template: html`
            <autocomplete-inline />
        `
    })
};

export const AutoHighlight: Story = {
    parameters: source(autoHighlightSource),
    render: () => ({
        template: html`
            <autocomplete-auto-highlight />
        `
    })
};

export const Grouped: Story = {
    parameters: source(groupedSource),
    render: () => ({
        template: html`
            <autocomplete-grouped />
        `
    })
};

export const Limit: Story = {
    parameters: source(limitSource),
    render: () => ({
        template: html`
            <autocomplete-limit />
        `
    })
};

export const FuzzyMatching: Story = {
    parameters: source(fuzzySource),
    render: () => ({
        template: html`
            <autocomplete-fuzzy />
        `
    })
};

export const Async: Story = {
    parameters: source(asyncSource),
    render: () => ({
        template: html`
            <autocomplete-async />
        `
    })
};

export const CommandPalette: Story = {
    parameters: source(commandPaletteSource),
    render: () => ({
        template: html`
            <autocomplete-command-palette />
        `
    })
};

export const Grid: Story = {
    parameters: source(gridSource),
    render: () => ({
        template: html`
            <autocomplete-grid />
        `
    })
};

export const Virtualized: Story = {
    parameters: source(virtualizedSource),
    render: () => ({
        template: html`
            <autocomplete-virtualized-example />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(reactiveFormsSource),
    render: () => ({
        template: html`
            <autocomplete-reactive-forms />
        `
    })
};

export const Validation: Story = {
    parameters: source(validationSource),
    render: () => ({
        template: html`
            <autocomplete-validation />
        `
    })
};

export const TemplateDrivenForms: Story = {
    parameters: source(templateFormsSource),
    render: () => ({
        template: html`
            <autocomplete-template-forms />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <autocomplete-disabled />
        `
    })
};
