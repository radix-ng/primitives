import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { CalendarCustomNavigation } from './calendar-custom-navigation';
import customNavigationSource from './calendar-custom-navigation?raw';
import { CalendarDefault } from './calendar-default';
import defaultSource from './calendar-default?raw';
import { CalendarDisabledDates } from './calendar-disabled-dates';
import disabledDatesSource from './calendar-disabled-dates?raw';
import { CalendarMultiple } from './calendar-multiple';
import multipleSource from './calendar-multiple?raw';
import { CalendarNumberOfMonths } from './calendar-number-of-months';
import numberOfMonthsSource from './calendar-number-of-months?raw';
import { CalendarUnavailableDates } from './calendar-unavailable-dates';
import unavailableDatesSource from './calendar-unavailable-dates?raw';
import { CalendarWeek } from './calendar-week';
import weekSource from './calendar-week?raw';
import { CalendarWithLocale } from './calendar-with-locale';
import withLocaleSource from './calendar-with-locale?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Calendar',
    decorators: [
        moduleMetadata({
            imports: [
                CalendarDefault,
                CalendarWithLocale,
                CalendarMultiple,
                CalendarWeek,
                CalendarDisabledDates,
                CalendarUnavailableDates,
                CalendarCustomNavigation,
                CalendarNumberOfMonths
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
            <app-calendar-default />
        `
    })
};

export const WithLocale: Story = {
    parameters: source(withLocaleSource),
    render: () => ({
        template: html`
            <app-calendar-with-locale />
        `
    })
};

export const Multiple: Story = {
    parameters: source(multipleSource),
    render: () => ({
        template: html`
            <app-calendar-multiple />
        `
    })
};

export const Week: Story = {
    parameters: source(weekSource),
    render: () => ({
        template: html`
            <app-calendar-week />
        `
    })
};

export const DisabledDates: Story = {
    parameters: source(disabledDatesSource),
    render: () => ({
        template: html`
            <app-calendar-disabled-dates />
        `
    })
};

export const UnavailableDates: Story = {
    parameters: source(unavailableDatesSource),
    render: () => ({
        template: html`
            <app-calendar-unavailable-dates />
        `
    })
};

export const CustomNavigation: Story = {
    parameters: source(customNavigationSource),
    render: () => ({
        template: html`
            <app-calendar-custom-navigation />
        `
    })
};

export const NumberOfMonths: Story = {
    parameters: source(numberOfMonthsSource),
    render: () => ({
        template: html`
            <app-calendar-number-of-months />
        `
    })
};
