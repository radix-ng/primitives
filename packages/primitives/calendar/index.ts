import { NgModule } from '@angular/core';

export { RdxCalendarCellTriggerDirective } from './src/calendar-cell-trigger.directive';
export { RdxCalendarCellDirective } from './src/calendar-cell.directive';
export { RdxCalendarGridBodyDirective } from './src/calendar-grid-body.directive';
export { RdxCalendarGridHeadDirective } from './src/calendar-grid-head.directive';
export { RdxCalendarGridRowDirective } from './src/calendar-grid-row.directive';
export { RdxCalendarGridDirective } from './src/calendar-grid.directive';
export { RdxCalendarHeadCellDirective } from './src/calendar-head-cell.directive';
export { RdxCalendarHeaderDirective } from './src/calendar-header.directive';
export { RdxCalendarHeadingDirective } from './src/calendar-heading.directive';
export { RdxCalendarNextDirective } from './src/calendar-next.directive';
export { RdxCalendarPrevDirective } from './src/calendar-prev.directive';
export { RdxCalendarRootDirective } from './src/calendar-root.directive';

import { RdxCalendarCellTriggerDirective } from './src/calendar-cell-trigger.directive';
import { RdxCalendarCellDirective } from './src/calendar-cell.directive';
import { RdxCalendarGridBodyDirective } from './src/calendar-grid-body.directive';
import { RdxCalendarGridHeadDirective } from './src/calendar-grid-head.directive';
import { RdxCalendarGridRowDirective } from './src/calendar-grid-row.directive';
import { RdxCalendarGridDirective } from './src/calendar-grid.directive';
import { RdxCalendarHeadCellDirective } from './src/calendar-head-cell.directive';
import { RdxCalendarHeaderDirective } from './src/calendar-header.directive';
import { RdxCalendarHeadingDirective } from './src/calendar-heading.directive';
import { RdxCalendarNextDirective } from './src/calendar-next.directive';
import { RdxCalendarPrevDirective } from './src/calendar-prev.directive';
import { RdxCalendarRootDirective } from './src/calendar-root.directive';

const _imports = [
    RdxCalendarCellTriggerDirective,
    RdxCalendarCellDirective,
    RdxCalendarGridBodyDirective,
    RdxCalendarGridHeadDirective,
    RdxCalendarGridRowDirective,
    RdxCalendarGridDirective,
    RdxCalendarHeadCellDirective,
    RdxCalendarHeaderDirective,
    RdxCalendarPrevDirective,
    RdxCalendarRootDirective,
    RdxCalendarHeadingDirective,
    RdxCalendarNextDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCalendarModule {}
