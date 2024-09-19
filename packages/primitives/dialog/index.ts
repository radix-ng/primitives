import { NgModule } from '@angular/core';
import { RdxDialogCloseDirective } from './src/dialog-close.directive';
import { RdxDialogContentDirective } from './src/dialog-content.directive';
import { RdxDialogDescriptionDirective } from './src/dialog-description.directive';
import { RdxDialogDismissDirective } from './src/dialog-dismiss.directive';
import { RdxDialogTitleDirective } from './src/dialog-title.directive';
import { RdxDialogTriggerDirective } from './src/dialog-trigger.directive';

export * from './src/dialog-close.directive';
export * from './src/dialog-content.directive';
export * from './src/dialog-description.directive';
export * from './src/dialog-dismiss.directive';
export * from './src/dialog-ref';
export * from './src/dialog-title.directive';
export * from './src/dialog-trigger.directive';
export * from './src/dialog.config';
export * from './src/dialog.injectors';
export * from './src/dialog.providers';
export * from './src/dialog.service';

const _imports = [
    RdxDialogTriggerDirective,
    RdxDialogContentDirective,
    RdxDialogTitleDirective,
    RdxDialogCloseDirective,
    RdxDialogDescriptionDirective,
    RdxDialogDismissDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxDialogModule {}
