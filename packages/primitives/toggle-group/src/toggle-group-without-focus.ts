import { Directive, inject } from '@angular/core';
import { provideFormUiState, provideValueAccessor, RdxFormUiStateHost } from '@radix-ng/primitives/core';
import { RdxToggleGroupBase, toggleGroupContext } from './toggle-group-base';
import { provideToggleGroupContext } from './toggle-group-context';

/**
 * A toggle group that does NOT create its own composite root, for use inside a container that
 * already owns keyboard focus (e.g. a toolbar). The `[rdxToggle]` children register with the nearest
 * ancestor composite root instead. `rdxToggleGroup` delegates automatically inside a Toolbar.
 */
@Directive({
    selector: '[rdxToggleGroupWithoutFocus]',
    exportAs: 'rdxToggleGroupWithoutFocus',
    hostDirectives: [RdxFormUiStateHost],
    providers: [
        provideToggleGroupContext(() => toggleGroupContext(inject(RdxToggleGroupWithoutFocus))),
        provideValueAccessor(RdxToggleGroupWithoutFocus),
        provideFormUiState(() => inject(RdxToggleGroupWithoutFocus).formUi)
    ]
})
export class RdxToggleGroupWithoutFocus extends RdxToggleGroupBase {}
