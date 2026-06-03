import { injectToolbarRootContext } from './toolbar-context';
import { Directive, effect, inject, input } from '@angular/core';
import { Orientation, RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

/**
 * A separator between toolbar items or groups.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarSeparator]',
    exportAs: 'rdxToolbarSeparator',
    hostDirectives: [RdxSeparatorRootDirective]
})
export class RdxToolbarSeparator {
    protected readonly rootContext = injectToolbarRootContext();
    private readonly separator = inject(RdxSeparatorRootDirective, { self: true });

    /**
     * The separator orientation. Defaults to the opposite of the toolbar orientation.
     */
    readonly orientation = input<Orientation | undefined>(undefined);

    constructor() {
        effect(() => {
            this.separator.updateOrientation(this.orientation() ?? this.defaultOrientation());
        });
    }

    private defaultOrientation(): Orientation {
        return this.rootContext.orientation() === 'horizontal' ? 'vertical' : 'horizontal';
    }
}
