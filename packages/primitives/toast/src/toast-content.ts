import { Directive } from '@angular/core';
import { injectRdxToastRootContext } from './toast-root';

/**
 * Wraps a toast's inner parts (title, description, actions) — the Angular counterpart of
 * `<Toast.Content>`. Headless: it carries no styles; consumers apply `overflow: hidden` to clip
 * taller toasts during the stack/expand animation. It mirrors the root's `data-state` so content
 * can transition together with the root.
 */
@Directive({
    selector: '[rdxToastContent]',
    exportAs: 'rdxToastContent',
    host: {
        '[attr.data-state]': 'rootContext.toast().transitionStatus === "ending" ? "closed" : "open"'
    }
})
export class RdxToastContent {
    protected readonly rootContext = injectRdxToastRootContext()!;
}
