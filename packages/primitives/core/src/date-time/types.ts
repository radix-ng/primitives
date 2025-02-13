/*
 * Implementation ported from https://github.com/melt-ui/melt-ui/blob/develop/src/lib/internal/helpers/date/types.ts
 */

import type { DateValue } from '@internationalized/date';

export type DateMatcher = (date: DateValue) => boolean;

export type HourCycle = 12 | 24;

export type Month<T> = {
    /**
     * A `DateValue` used to represent the month. Since days
     * from the previous and next months may be included in the
     * calendar grid, we need a source of truth for the value
     * the grid is representing.
     */
    value: DateValue;

    /**
     * An array of (rows) arrays representing the weeks in the calendar.
     * Each sub-array represents a week, and contains the dates for each
     * day in that week. This structure is useful for rendering the calendar
     * grid using a table, where each row represents a week and each cell
     * represents a day.
     */
    weeks: T[][];

    /**
     * An array of (cells) all the dates in the current month, including dates from
     * the previous and next months that are used to fill out the calendar grid.
     * This array is useful for rendering the calendar grid in a customizable way,
     * as it provides all the dates that should be displayed in the grid in a flat
     * array.
     */
    dates: T[];
};
