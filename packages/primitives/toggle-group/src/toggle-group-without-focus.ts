import { Directive, inject } from '@angular/core';
import { provideValueAccessor } from '@radix-ng/primitives/core';
import { RdxToggleGroupBase, toggleGroupContext } from './toggle-group-base';
import { provideToggleGroupContext } from './toggle-group-context';

/**
 * A toggle group that does NOT create its own roving-focus group, for use inside a container that
 * already owns keyboard focus (e.g. a toolbar). The `[rdxToggle]` children register with the nearest
 * ancestor roving-focus group instead. Mirrors Base UI's behavior of skipping its composite root
 * when nested in a toolbar.
 */
@Directive({
    selector: '[rdxToggleGroupWithoutFocus]',
    exportAs: 'rdxToggleGroupWithoutFocus',
    providers: [
        provideToggleGroupContext(() => toggleGroupContext(inject(RdxToggleGroupWithoutFocus))),
        provideValueAccessor(RdxToggleGroupWithoutFocus)
    ]
})
export class RdxToggleGroupWithoutFocus extends RdxToggleGroupBase {}
