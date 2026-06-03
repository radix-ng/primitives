import { RdxToastManager } from './toast-provider';
import { DestroyRef, Directive, effect, inject, signal } from '@angular/core';

/**
 * The positioned region that holds the visible toasts — the Angular counterpart of
 * `<Toast.Viewport>`. Exposes the queue for templates to render, and while it is hovered or focused
 * it expands the stack (`data-expanded` on each root) and pauses every auto-dismiss timer, resuming
 * once neither hover nor focus remains — matching Base UI.
 *
 * Headless: it carries no positioning styles. Consumers position it (e.g. fixed bottom-right) and
 * iterate `viewport.toasts()` with `@for`.
 */
@Directive({
    selector: '[rdxToastViewport]',
    exportAs: 'rdxToastViewport',
    host: {
        role: 'region',
        tabindex: '-1',
        '(mouseenter)': 'hovered.set(true)',
        '(mouseleave)': 'hovered.set(false)',
        '(focusin)': 'focused.set(true)',
        '(focusout)': 'onFocusOut($event)'
    }
})
export class RdxToastViewport {
    protected readonly manager = inject(RdxToastManager);

    /** The live toast queue to render. */
    readonly toasts = this.manager.toasts;

    protected readonly hovered = signal(false);
    protected readonly focused = signal(false);

    /** Tracks the last expanded state so pause/resume stay balanced across transitions. */
    private wasExpanded = false;

    constructor() {
        effect(() => {
            const expanded = this.hovered() || this.focused();
            this.manager.setExpanded(expanded);

            if (expanded && !this.wasExpanded) {
                this.wasExpanded = true;
                this.manager.pauseAll();
            } else if (!expanded && this.wasExpanded) {
                this.wasExpanded = false;
                this.manager.resumeAll();
            }
        });

        // If the viewport is destroyed while still expanded, balance the outstanding pause so a
        // longer-lived manager doesn't stay paused forever.
        inject(DestroyRef).onDestroy(() => {
            if (this.wasExpanded) {
                this.wasExpanded = false;
                this.manager.setExpanded(false);
                this.manager.resumeAll();
            }
        });
    }

    protected onFocusOut(event: FocusEvent): void {
        // Only clear focus when it actually leaves the viewport subtree.
        const next = event.relatedTarget as Node | null;
        const host = event.currentTarget as HTMLElement | null;
        if (!host || !next || !host.contains(next)) {
            this.focused.set(false);
        }
    }
}
