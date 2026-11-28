import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    signal,
    untracked
} from '@angular/core';
import { getActiveElement, RdxLiveAnnouncer } from '@radix-ng/primitives/core';
import { composedContains, tabbable } from '@radix-ng/primitives/focus-scope';
import { RdxToastManager } from './toast-provider';

/**
 * The positioned region that holds the visible toasts. Hover or keyboard focus expands the stack
 * and pauses auto-dismiss. F6 moves focus between the notifications and the previous control.
 */
@Directive({
    selector: '[rdxToastViewport]',
    exportAs: 'rdxToastViewport',
    providers: [RdxLiveAnnouncer],
    host: {
        role: 'region',
        tabindex: '-1',
        'aria-label': 'Notifications',
        'aria-live': 'polite',
        'aria-atomic': 'false',
        'aria-relevant': 'additions text',
        '[attr.data-expanded]': 'manager.expanded() ? "" : undefined',
        '[style.--toast-frontmost-height.px]': 'manager.frontmostHeight()',
        '(mouseenter)': 'hovered.set(true)',
        '(mouseleave)': 'hovered.set(false)',
        '(focusin)': 'onFocusIn()',
        '(focusout)': 'onFocusOut($event)',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxToastViewport {
    protected readonly manager = inject(RdxToastManager);
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly announcer = inject(RdxLiveAnnouncer);
    private readonly roots = new Map<string, HTMLElement>();

    /** The live toast queue to render. */
    readonly toasts = this.manager.toasts;

    protected readonly hovered = signal(false);
    private readonly focused = signal(false);
    private readonly windowBlurred = signal(false);
    private readonly visible = computed(() =>
        this.toasts().filter((toast) => !toast.limited && toast.transitionStatus !== 'ending')
    );

    /** @internal Whether the viewport has keyboard focus. */
    readonly keyboardFocused = this.focused.asReadonly();

    private returnFocus: HTMLElement | null = null;
    private paused = false;

    constructor() {
        const destroyRef = inject(DestroyRef);
        effect(() => {
            const expanded = this.hovered() || this.focused();
            const paused = expanded || this.windowBlurred();
            untracked(() => {
                this.manager.setExpanded(expanded);
                if (paused !== this.paused) {
                    this.paused = paused;
                    if (paused) this.manager.pauseAll();
                    else this.manager.resumeAll();
                }
            });
        });

        let announced = new Map<string, string>();
        effect(() => {
            const focused = this.focused();
            const next = new Map<string, string>();
            const messages: string[] = [];
            for (const toast of this.visible()) {
                if (toast.priority !== 'high') continue;
                const message = [toast.title, toast.description].filter(Boolean).join('. ');
                if (!message) continue;
                if (!focused && message !== announced.get(toast.id)) messages.push(message);
                next.set(toast.id, message);
            }
            announced = next;
            if (messages.length > 0) this.announcer.announce(messages.join('. '), 'assertive');
        });

        afterNextRender(() => {
            const win = this.element.ownerDocument.defaultView;
            if (!win) return;
            const listeners = new AbortController();
            win.addEventListener('keydown', (event) => this.onWindowKeyDown(event), { signal: listeners.signal });
            win.addEventListener('blur', () => this.windowBlurred.set(true), { signal: listeners.signal });
            win.addEventListener('focus', () => this.windowBlurred.set(false), { signal: listeners.signal });
            destroyRef.onDestroy(() => listeners.abort());
        });

        destroyRef.onDestroy(this.manager.onClose((ids) => this.recoverFocus(ids)));
        destroyRef.onDestroy(() => {
            this.manager.setExpanded(false);
            if (this.paused) this.manager.resumeAll();
        });
    }

    /** @internal Connects a rendered Root to the queue for focus recovery. */
    registerRoot(id: string, root: HTMLElement): () => void {
        this.roots.set(id, root);
        return () => {
            if (this.roots.get(id) === root) this.roots.delete(id);
        };
    }

    protected onFocusIn(): void {
        if (getActiveElement(this.element.ownerDocument)?.matches(':focus-visible')) this.focused.set(true);
    }

    protected onFocusOut(event: FocusEvent): void {
        if (!composedContains(this.element, event.relatedTarget as Node | null)) {
            this.focused.set(false);
            this.returnFocus = null;
        }
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.defaultPrevented) return;
        if (event.key === 'F6') {
            event.stopPropagation();
            if (this.restoreFocus()) event.preventDefault();
            return;
        }
        if (event.key !== 'Tab' || !this.returnFocus) return;

        const active = getActiveElement(this.element.ownerDocument);
        if (event.shiftKey && active === this.element) {
            if (this.restoreFocus()) event.preventDefault();
            return;
        }
        const stops = tabbable(this.element);
        const edge = event.shiftKey ? stops[0] : stops.at(-1);
        if ((!edge || active === edge) && this.restoreFocus()) event.preventDefault();
    }

    private onWindowKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'F6' || event.defaultPrevented || this.visible().length === 0) return;
        const active = getActiveElement(this.element.ownerDocument);
        if (composedContains(this.element, active)) return;
        this.returnFocus = active && 'focus' in active ? (active as HTMLElement) : null;
        this.element.focus({ preventScroll: true });
        if (getActiveElement(this.element.ownerDocument) === this.element) {
            this.focused.set(true);
            event.preventDefault();
        } else {
            this.returnFocus = null;
        }
    }

    private recoverFocus(ids: ReadonlySet<string>): void {
        const active = getActiveElement(this.element.ownerDocument);
        if (
            !active ||
            !composedContains(this.element, active) ||
            (!this.focused() && !active.matches(':focus-visible'))
        )
            return;

        const toasts = this.toasts();
        const closingIndex = toasts.findIndex((toast) => {
            const root = this.roots.get(toast.id);
            return ids.has(toast.id) && toast.transitionStatus === 'ending' && root && composedContains(root, active);
        });
        if (closingIndex === -1 && (active !== this.element || this.visible().length > 0)) return;

        const siblings = [...toasts.slice(0, closingIndex).reverse(), ...toasts.slice(closingIndex + 1)];
        const next = siblings
            .filter((toast) => !toast.limited && toast.transitionStatus !== 'ending')
            .map((toast) => this.roots.get(toast.id))
            .find((root) => root && !root.inert && root.isConnected);
        if (next) next.focus({ preventScroll: true });
        else if (!this.restoreFocus() && 'blur' in active) (active as HTMLElement).blur();
    }

    private restoreFocus(): boolean {
        const target = this.returnFocus;
        if (!target?.isConnected) return false;
        const document = this.element.ownerDocument;
        if (target === document.body) (getActiveElement(document) as HTMLElement | null)?.blur();
        else target.focus({ preventScroll: true });
        return !composedContains(this.element, getActiveElement(document));
    }
}
