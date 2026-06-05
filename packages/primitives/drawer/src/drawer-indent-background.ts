import { Directive, inject } from '@angular/core';
import { RdxDrawerProvider } from './drawer-provider';

/**
 * The page background layer that scales/indents while any drawer is open.
 *
 * Behaves like {@link RdxDrawerIndent} (same `[data-active]` / `--nested-drawers` /
 * `--drawer-frontmost-height` contract); kept as a distinct part so the page backdrop and the
 * indented content can be styled independently, mirroring Base UI.
 */
@Directive({
    selector: '[rdxDrawerIndentBackground]',
    exportAs: 'rdxDrawerIndentBackground',
    host: {
        '[attr.data-active]': 'provider?.active() ? "" : undefined',
        '[style.--nested-drawers]': 'provider?.count() ?? 0',
        '[style.--drawer-frontmost-height]': '(provider?.frontmostHeight() ?? 0) + "px"'
    }
})
export class RdxDrawerIndentBackground {
    protected readonly provider = inject(RdxDrawerProvider, { optional: true });
}
