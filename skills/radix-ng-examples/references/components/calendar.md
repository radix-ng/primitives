# Calendar

Displays dates and days of the week, facilitating date-related interactions.

> Index — full source of each example is one click away in `../examples/calendar--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Full keyboard navigation.
- ✅ Can be controlled or uncontrolled
- ✅ Focus is fully managed
- ✅ Localization support
- ✅ Highly composable

## Anatomy

Import all parts and piece them together.

```html
<div rdxCalendarRoot #root="rdxCalendarRoot">
  <div rdxCalendarHeader>
    <button type="button" rdxCalendarPrev></button>
    <div #head="rdxCalendarHeading" rdxCalendarHeading>{{ head.headingValue() }}</div>
    <button type="button" rdxCalendarNext></button>
  </div>

  <table rdxCalendarGrid>
    @for (month of root.months(); track $index) {
    <thead rdxCalendarGridHead>
      <tr rdxCalendarGridRow>
        @for (day of root.weekDays(); track $index) {
        <th rdxCalendarHeadCell>{{ day }}</th>
        }
      </tr>
    </thead>
    <tbody rdxCalendarGridBody>
      @for (weekDates of month.weeks; track $index) {
      <tr rdxCalendarGridRow>
        @for (weekDate of weekDates; track $index) {
        <td rdxCalendarCell>
          <div #cell="rdxCalendarCellTrigger" rdxCalendarCellTrigger>{{ cell.dayValue() }}</div>
        </td>
        }
      </tr>
      }
    </tbody>
    }
  </table>
</div>
```

## Examples

- [Calendar with Locale and Calendar System Selection](../examples/calendar--calendar-with-locale-and-calendar-system-selection.md)
- [Multiple selection](../examples/calendar--multiple-selection.md)
- [Week numbers](../examples/calendar--week-numbers.md)
- [Disabled dates](../examples/calendar--disabled-dates.md)
- [Unavailable dates](../examples/calendar--unavailable-dates.md)
- [Custom navigation](../examples/calendar--custom-navigation.md)
- [Multiple months](../examples/calendar--multiple-months.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/calendar.json`
- Styling (parts + `data-*`): `references/styling-contract/calendar.json`
