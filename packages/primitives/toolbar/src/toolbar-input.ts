import { injectToolbarGroupContext, injectToolbarRootContext } from './toolbar-context';
import { isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    PLATFORM_ID
} from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput } from '@radix-ng/primitives/core';

/**
 * A native input within a toolbar. Participates in the toolbar's composite focus while keeping native
 * text-editing: the arrow keys move the caret within the text and only move focus to the
 * neighbouring toolbar item once the caret is at the corresponding edge (Base UI "composite" input).
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: 'input[rdxToolbarInput]',
    exportAs: 'rdxToolbarInput',
    hostDirectives: [RdxCompositeItem],
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-focusable]': 'focusableWhenDisabled() ? "" : undefined',
        // The host is always a native `<input>` (selector-pinned), i.e. not a native button, so it
        // conveys disabled via `aria-disabled` only — never the native `disabled` attribute, which would
        // drop a disabled-but-focusable item out of the roving tab order. Roving removal for
        // non-focusable-when-disabled inputs goes through the composite root's `disabledIndices` (driven
        // by the metadata below); pointer interaction is blocked in `onInteraction`.
        '[attr.aria-disabled]': 'isDisabled() ? "true" : undefined',
        '(click)': 'onInteraction($event)',
        '(pointerdown)': 'onInteraction($event)'
    }
})
export class RdxToolbarInput {
    protected readonly rootContext = injectToolbarRootContext();
    private readonly groupContext = injectToolbarGroupContext(true);
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    /** The initial value of the uncontrolled input. */
    readonly defaultValue = input<string>();

    /**
     * Whether the input is disabled.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input stays focusable while disabled.
     *
     * @default true
     */
    readonly focusableWhenDisabled = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** @ignore */
    readonly isDisabled = computed(
        () => this.disabled() || (this.groupContext?.disabled() ?? false) || this.rootContext.disabled()
    );

    private appliedDefault = false;

    constructor() {
        effect(() => {
            this.compositeItem.setMetadata({
                disabled: this.isDisabled(),
                focusableWhenDisabled: this.focusableWhenDisabled()
            });
        });

        effect(() => {
            const value = this.defaultValue();
            if (!this.appliedDefault && value !== undefined) {
                this.appliedDefault = true;
                this.elementRef.nativeElement.value = value;
            }
        });

        if (this.isBrowser) {
            // Registered in the constructor — i.e. before the composite root's delegated keydown
            // — so it runs first and can keep arrow keys for caret movement (via
            // `stopImmediatePropagation`) unless the caret is at the edge, where the event is allowed
            // to reach the composite root and move focus.
            const element = this.elementRef.nativeElement;
            const handler = (event: KeyboardEvent) => this.handleCaretKeydown(event);
            element.addEventListener('keydown', handler, { capture: true });
            inject(DestroyRef).onDestroy(() => element.removeEventListener('keydown', handler, { capture: true }));
        }
    }

    /** @ignore Block pointer interaction while disabled (Base UI input `defaultProps`). */
    protected onInteraction(event: Event): void {
        if (this.isDisabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    private handleCaretKeydown(event: KeyboardEvent): void {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
            return;
        }

        const horizontal = this.rootContext.orientation() === 'horizontal';
        const previousKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
        const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
        const key = event.key;

        if (key !== previousKey && key !== nextKey && key !== 'Home' && key !== 'End') {
            return;
        }

        // Home/End always move the caret within the text.
        if (key === 'Home' || key === 'End') {
            event.stopImmediatePropagation();
            return;
        }

        const element = this.elementRef.nativeElement;
        let start: number | null;
        let end: number | null;
        try {
            start = element.selectionStart;
            end = element.selectionEnd;
        } catch {
            // Inputs such as `type="number"` don't expose a selection — let the toolbar navigate.
            return;
        }

        if (start === null || end === null) {
            return;
        }

        const length = element.value.length;
        const atStart = start === 0 && end === 0;
        const atEnd = start === length && end === length;

        // Keep the key for caret movement unless the caret is already at the edge we're moving toward.
        if ((key === previousKey && !atStart) || (key === nextKey && !atEnd)) {
            event.stopImmediatePropagation();
        }
    }
}
