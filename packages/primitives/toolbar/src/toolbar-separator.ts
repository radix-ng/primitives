import { Directive, effect, inject, input } from '@angular/core';
import { Orientation, RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
import { injectToolbarRootContext } from './toolbar-context';

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
     * Omit the input to follow the opposite of the toolbar orientation. Binding `undefined`
     * uses the standalone Separator default of `horizontal`.
     */
    readonly orientation = input<Orientation | undefined, Orientation | undefined>(undefined, {
        transform: (orientation) => orientation ?? 'horizontal'
    });

    constructor() {
        effect(() => {
            this.separator.updateOrientation(this.orientation() ?? this.defaultOrientation());
        });
    }

    private defaultOrientation(): Orientation {
        return this.rootContext.orientation() === 'horizontal' ? 'vertical' : 'horizontal';
    }
}
