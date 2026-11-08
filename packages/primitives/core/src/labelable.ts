import { computed, effect, ElementRef, inject, Signal, signal, untracked } from '@angular/core';

/** @internal A label slot shared by a field or a compound control. Registrations own their cleanup. */
export interface RdxLabelRegistry {
    readonly labelId: Signal<string | undefined>;
    registerLabel(id: string): () => void;
}

/** @internal Keeps a replacement label registered when an older view is destroyed after it mounts. */
export function createLabelRegistry(): RdxLabelRegistry {
    const registrations = signal<readonly { owner: object; id: string }[]>([]);
    return {
        labelId: computed(() => registrations().at(-1)?.id, { debugName: 'RdxLabelRegistry.labelId' }),
        registerLabel(id) {
            const owner = {};
            registrations.update((current) => [...current, { owner, id }]);
            return () => registrations.update((current) => current.filter((entry) => entry.owner !== owner));
        }
    };
}

/** @internal Configuration for the shared label behavior. */
export interface RdxLabelOptions {
    id: () => string;
    registries: readonly RdxLabelRegistry[];
    controlId?: () => string | undefined;
    control?: () => HTMLElement | null;
}

/** @internal Find an associated control in the label's shadow tree, its enclosing trees, or its document. */
export function getLabelControl(label: Element, id: string): HTMLElement | null {
    let root = label.getRootNode();
    while (root.nodeType === 11 && 'host' in root) {
        const shadowRoot = root as ShadowRoot;
        const control = shadowRoot.getElementById(id);
        if (control) return control;
        root = shadowRoot.host.getRootNode();
    }
    return label.ownerDocument.getElementById(id);
}

function isInteractiveTarget(event: Event, label: HTMLElement): boolean {
    const ElementType = label.ownerDocument.defaultView?.Element;
    for (const target of event.composedPath()) {
        if (target === label) break;
        if (
            ElementType &&
            target instanceof ElementType &&
            target.matches('button, input, select, textarea, a[href], [contenteditable="true"]')
        )
            return true;
    }
    return false;
}

/**
 * Shared label behavior, corresponding to Base UI's useLabel / useRegisteredLabelId.
 * The directive binds the returned handlers; the primitive retains all popup/value behavior.
 * @internal
 */
export function useLabel(options: RdxLabelOptions) {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const native = element.localName === 'label';

    effect(
        (onCleanup) => {
            const id = options.id();
            const unregister = untracked(() => options.registries.map((registry) => registry.registerLabel(id)));
            onCleanup(() => untracked(() => unregister.forEach((remove) => remove())));
        },
        { debugName: 'RdxLabel.registration' }
    );

    const htmlFor = () => (native ? options.controlId?.() : undefined);
    const ignore = (event: MouseEvent) => event.defaultPrevented || isInteractiveTarget(event, element);

    return {
        htmlFor,
        onMouseDown(event: MouseEvent): void {
            if (native && !ignore(event) && event.detail > 1) event.preventDefault();
        },
        onPointerDown(event: PointerEvent): void {
            if (!native && !ignore(event)) event.preventDefault();
        },
        onClick(event: MouseEvent): void {
            if (ignore(event) || (native && htmlFor())) return;
            if (event.detail > 1) event.preventDefault();
            const id = options.controlId?.();
            const control = options.control?.() ?? (id ? getLabelControl(element, id) : null);
            const focusOptions = { preventScroll: false, focusVisible: true };
            control?.focus(focusOptions);
        }
    };
}
