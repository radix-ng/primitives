import { NgModule } from '@angular/core';
import { RdxCalendarHeadingDirective } from './src/calendar-heading.directive';
import { RdxCalendarNextDirective } from './src/calendar-next.directive';

const _imports = [
    RdxCalendarHeadingDirective,
    RdxCalendarNextDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCalendarModule {}
