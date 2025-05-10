import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
    TimeField,
    TimeFieldGranularHour,
    TimeFieldGranularMinute,
    TimeFieldGranularSecond,
    TimeFieldLocaleGregorian,
    TimeFieldLocaleJapanese,
    TimeFieldLocalePersian,
    TimeFieldLocaleTaiwan
} from './time-field';

const html = String.raw;

export default {
    title: 'Primitives/Time Field',
    decorators: [
        moduleMetadata({
            imports: [
                TimeField,
                TimeFieldGranularSecond,
                TimeFieldGranularMinute,
                TimeFieldGranularHour,
                TimeFieldLocaleGregorian,
                TimeFieldLocaleJapanese,
                TimeFieldLocalePersian,
                TimeFieldLocaleTaiwan
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <app-time-field style="display: flex;" />
        `
    })
};

export const Granular: Story = {
    render: () => ({
        template: html`
            <app-time-field-granular-second style="display: flex; padding-bottom: 16px;" />

            <app-time-field-granular-minute style="display: flex; padding-bottom: 16px;" />

            <app-time-field-granular-hour style="display: flex;" />
        `
    })
};

export const Locale: Story = {
    render: () => ({
        template: html`
            <app-time-field-locale-gregorian style="display: flex; padding-bottom: 16px;" />

            <app-time-field-locale-japanese style="display: flex; padding-bottom: 16px;" />

            <app-time-field-locale-persian style="display: flex; padding-bottom: 16px;" />

            <app-time-field-locale-taiwan style="display: flex; padding-bottom: 16px;" />
        `
    })
};
