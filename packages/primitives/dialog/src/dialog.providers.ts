import { DialogModule } from '@angular/cdk/dialog';
import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders, Provider } from '@angular/core';
import { RdxDialogService } from './dialog.service';

/**
 * Configures the RdxDialog module by providing necessary dependencies.
 *
 * This function sets up the environment providers required for the RdxDialog to function,
 * specifically importing the Angular CDK's DialogModule.
 *
 * @returns {EnvironmentProviders} An EnvironmentProviders instance containing the DialogModule.
 */
export function configureRdxDialog(): EnvironmentProviders {
    return makeEnvironmentProviders([importProvidersFrom(DialogModule)]);
}

/**
 * Provides the RdxDialogService for dependency injection.
 *
 * This function is used to make the RdxDialogService available for injection
 * in components, directives, or other services that require dialog functionality.
 *
 * @returns {Provider} A provider for the RdxDialogService.
 */
export function provideRdxDialog(): Provider {
    return RdxDialogService;
}
