import { Directive, inject } from '@angular/core';
import { provideValueAccessor } from '@radix-ng/primitives/core';
import { injectToolbarGroupContext, injectToolbarRootContext } from '@radix-ng/primitives/toolbar';
import { RdxToggleGroupBase, toggleGroupContext } from './toggle-group-base';
import { provideToggleGroupContext } from './toggle-group-context';

/**
 * A toggle group that does NOT create its own composite root, for use inside a container that
 * already owns keyboard focus (e.g. a toolbar). The `[rdxToggle]` children register with the nearest
 * ancestor composite root instead. Mirrors Base UI's behavior of skipping its composite root
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
export class RdxToggleGroupWithoutFocus extends RdxToggleGroupBase {
    private readonly toolbarRootContext = injectToolbarRootContext(true);
    private readonly toolbarGroupContext = injectToolbarGroupContext(true);

    protected override isExternallyDisabled(): boolean {
        return (this.toolbarRootContext?.disabled() ?? false) || (this.toolbarGroupContext?.disabled() ?? false);
    }
}
