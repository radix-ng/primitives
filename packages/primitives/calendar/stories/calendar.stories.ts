import { CalendarDate } from '@internationalized/date';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxCalendarGridHeadDirective } from '../src/calendar-grid-head.directive';
import { RdxCalendarGridDirective } from '../src/calendar-grid.directive';
import { RdxCalendarHeaderDirective } from '../src/calendar-header.directive';
import { RdxCalendarRootDirective } from '../src/calendar-root.directive';

const html = String.raw;

export default {
    title: 'Primitives/Calendar',
    decorators: [
        moduleMetadata({
            imports: [
                RdxCalendarRootDirective,
                RdxCalendarHeaderDirective,
                RdxCalendarGridDirective,
                RdxCalendarGridHeadDirective
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
        props: {
            date: new CalendarDate(2024, 10, 3)
        },
        template: `
            <div style="width: 680px;">
                <div class="Calendar" rdxCalendarRoot #root="rdxCalendarRoot" fixedWeeks [value]="date">
                    <div class="CalendarHeader" rdxCalendarHeader></div>
                    <div class="CalendarContainer">
                        <table rdxCalendarGrid class="CalendarGrid">
                            @for (month of root.months(); track month) {
                            <thead rdxCalendarGridHead>
                                <tr>
                                    @for (day of root.weekDays(); track $index) {
                                        <th class="CalendarHeadCell">{{ day }}</th>
                                    }
                                </tr>
                            </thead>
                            }
                        </table>
                    </div>
                </div>
            </div>

            <style>
                .CalendarHeadCell {
                    border-radius: 0.375rem;
                    font-size: 0.75rem;
                    color: #30A46C;
                }

                .CalendarGrid {
                    margin-top: 1.5rem;
                    border-radius: 0.75rem;
                    background-color: #ffffff;
                    padding: 1rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                }

                .Calendar {
                    margin-top: 1.5rem;
                    border-width: 1px;
                    border-color: #000000;
                    background-color: #ffffff;
                    box-shadow:
                        0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    padding: 22px;
                }

                .CalendarHeader {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .CalendarContainer {
                    display: flex;
                    flex-direction: column;
                    padding-top: 1rem; /* pt-4 */

                    gap: 1rem; /* space-y-4 = vertical gap */
                }

                @media (min-width: 640px) {
                    .CalendarContainer {
                        flex-direction: row; /* sm:flex-row */
                        gap: 0; /* сбрасываем vertical gap */
                    }

                    .CalendarContainer > * + * {
                        margin-left: 1rem; /* sm:space-x-4 */
                    }
                }
            </style>
        `
    })
};
