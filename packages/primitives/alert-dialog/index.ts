import { NgModule } from '@angular/core';
import { RdxAlertDialogCancelDirective } from './src/alert-dialog-cancel.directive';
import { RdxAlertDialogContentDirective } from './src/alert-dialog-content.directive';
import { RdxAlertDialogRootDirective } from './src/alert-dialog-root.directive';
import { RdxAlertDialogTitleDirective } from './src/alert-dialog-title.directive';
import { RdxAlertDialogTriggerDirective } from './src/alert-dialog-trigger.directive';

export * from './src/alert-dialog-cancel.directive';
export * from './src/alert-dialog-content.directive';
export * from './src/alert-dialog-root.directive';
export * from './src/alert-dialog-title.directive';
export * from './src/alert-dialog-trigger.directive';

export * from './src/alert-dialog.service';

const _imports = [
    RdxAlertDialogRootDirective,
    RdxAlertDialogContentDirective,
    RdxAlertDialogCancelDirective,
    RdxAlertDialogTriggerDirective,
    RdxAlertDialogTitleDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxAlertDialogModule {}
