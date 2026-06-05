import { Directive, inject } from '@angular/core';
import { RdxDrawerProvider } from './drawer-provider';

/**
 * Background content that scales/indents while any drawer is open.
 *
 * Reads the nearest {@link RdxDrawerProvider} and exposes styling hooks; the visual transform is
 * consumer CSS (headless):
 * - `[data-active]` — present while at least one drawer is open.
 * - `--nested-drawers` — the number of open drawers.
 * - `--drawer-frontmost-height` — the frontmost drawer's measured size, in pixels.
 */
@Directive({
    selector: '[rdxDrawerIndent]',
    exportAs: 'rdxDrawerIndent',
    host: {
        '[attr.data-active]': 'provider?.active() ? "" : undefined',
        '[style.--nested-drawers]': 'provider?.count() ?? 0',
        '[style.--drawer-frontmost-height]': '(provider?.frontmostHeight() ?? 0) + "px"'
    }
})
export class RdxDrawerIndent {
    protected readonly provider = inject(RdxDrawerProvider, { optional: true });
}
