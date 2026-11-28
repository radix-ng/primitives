import { Directive } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

/**
 * Wraps a toast's inner parts (title, description, actions) — the Angular counterpart of
 * `<Toast.Content>`. Headless: it carries no styles; consumers apply `overflow: hidden` to clip
 * taller toasts during the stack/expand animation. Exposes the expanded and behind states.
 */
@Directive({
    selector: '[rdxToastContent]',
    exportAs: 'rdxToastContent',
    host: {
        '[attr.data-expanded]': 'rootContext.expanded() ? "" : undefined',
        '[attr.data-behind]': 'rootContext.behind() ? "" : undefined'
    }
})
export class RdxToastContent {
    protected readonly rootContext = injectRdxToastRootContext();
}
