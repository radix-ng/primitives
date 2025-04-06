import { NgModule } from '@angular/core';

export { RdxCalendarHeadingDirective } from './src/calendar-heading.directive';
export { RdxCalendarNextDirective } from './src/calendar-next.directive';
export { RdxCalendarRootDirective } from './src/calendar-root.directive';

import { RdxCalendarHeadingDirective } from './src/calendar-heading.directive';
import { RdxCalendarNextDirective } from './src/calendar-next.directive';
import { RdxCalendarRootDirective } from './src/calendar-root.directive';

const _imports = [
    RdxCalendarRootDirective,
    RdxCalendarHeadingDirective,
    RdxCalendarNextDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCalendarModule {}
