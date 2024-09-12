import { DialogModule } from '@angular/cdk/dialog';
import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders, Provider } from '@angular/core';
import { RdxDialogService } from './dialog.service';

export function configureRdxDialog(): EnvironmentProviders {
    return makeEnvironmentProviders([importProvidersFrom(DialogModule)]);
}

export function provideRdxDialog(): Provider {
    return RdxDialogService;
}
