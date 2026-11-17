import { isPlatformBrowser } from '@angular/common';
import {
    APP_ID,
    effect,
    ElementRef,
    inject,
    Injectable,
    Injector,
    makeStateKey,
    PLATFORM_ID,
    Renderer2,
    RendererFactory2,
    TransferState,
    ViewContainerRef
} from '@angular/core';
import { createViewAnchor } from './view-anchor';

const IDS_ATTRIBUTE = 'data-rdx-ids';

interface IdOwner {
    element: Element;
    values: Map<string, string[]>;
    cursors: Map<string, number>;
}

/**
 * Allocates IDs within an application. View-owned IDs are serialized on their Angular-owned native
 * element and recovered independently of island hydration order. Transferred counters reserve every
 * server allocation, including owners that have not hydrated yet, before new client allocations.
 *
 * Prefer the {@link injectId} hook at call sites; inject this service directly only when you need to
 * generate IDs lazily outside an injection context.
 */
@Injectable({ providedIn: 'root' })
export class RdxIdGenerator {
    private readonly appId = inject(APP_ID);
    private readonly counters = new Map<string, number>();
    private readonly owners = new WeakMap<Node, IdOwner>();
    private readonly injector = inject(Injector);
    private renderer: Renderer2 | undefined;

    constructor() {
        const state = inject(TransferState);
        const key = makeStateKey<Record<string, number>>(`rdx-ids:${this.appId}`);
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
            for (const [prefix, count] of Object.entries(state.get(key, {})))
                if (Number.isSafeInteger(count) && count >= 0) this.counters.set(prefix, count);
        } else {
            state.onSerialize(key, () => Object.fromEntries(this.counters));
        }
    }

    /** Allocates a fresh application-local ID; it does not recover a server view's identity. */
    getId(prefix: string): string {
        const key = this.appId === 'ng' ? prefix : prefix + this.appId;
        const next = this.counters.get(key) ?? 0;
        this.counters.set(key, next + 1);

        return `${key}${next}`;
    }

    /** @internal Resolve one constructor-time allocation within its native/structural owner. */
    getOwnedId(prefix: string, node: Node, createElement: () => Element): string {
        let owner = this.owners.get(node);
        if (!owner) {
            const element = createElement();
            let values = new Map<string, string[]>();
            try {
                const serialized: unknown = JSON.parse(element.getAttribute(IDS_ATTRIBUTE) ?? '[]');
                if (Array.isArray(serialized))
                    values = new Map(
                        serialized.filter(
                            (entry): entry is [string, string[]] =>
                                Array.isArray(entry) &&
                                typeof entry[0] === 'string' &&
                                Array.isArray(entry[1]) &&
                                entry[1].every((id: unknown) => typeof id === 'string')
                        )
                    );
            } catch {
                /* A fresh CSR owner has no serialized allocations. */
            }
            owner = { element, values, cursors: new Map() };
            this.owners.set(node, owner);
        }
        const key = this.appId === 'ng' ? prefix : prefix + this.appId;
        const index = owner.cursors.get(key) ?? 0;
        owner.cursors.set(key, index + 1);
        const values = owner.values.get(key) ?? [];
        let id = values[index];
        const suffix = id?.startsWith(key) ? id.slice(key.length) : '';
        if (suffix && /^\d+$/.test(suffix) && Number.isSafeInteger(Number(suffix))) {
            this.counters.set(key, Math.max(this.counters.get(key) ?? 0, Number(suffix) + 1));
        } else {
            id = this.getId(prefix);
            values[index] = id;
            owner.values.set(key, values);
            this.renderer ??= this.injector.get(RendererFactory2).createRenderer(null, null);
            this.renderer.setAttribute(owner.element, IDS_ATTRIBUTE, JSON.stringify([...owner.values]));
        }
        return id;
    }
}

/**
 * Returns an application-local ID, recovering its server allocation from the Angular-owned host
 * during hydration. Sibling @defer islands may hydrate in any order. Constructor allocations must
 * keep the same order within one host and prefix. Structural owners use an inert managed template.
 * Call in a directive/component field initializer or constructor. Outside a native view owner this
 * falls back to fresh allocation, like RdxIdGenerator.getId.
 *
 * @example
 * readonly contentId = injectId('rdx-dialog-content-');
 */
export function injectId(prefix: string): string {
    const generator = inject(RdxIdGenerator);
    const node = inject<ElementRef<Node>>(ElementRef, { optional: true })?.nativeElement;
    if (!node || (node.nodeType !== 1 && node.nodeType !== 8)) return generator.getId(prefix);
    return generator.getOwnedId(prefix, node, () => {
        if (node.nodeType === 1) return node as Element;
        const anchor = createViewAnchor(inject(ViewContainerRef));
        if (!isPlatformBrowser(inject(PLATFORM_ID)))
            // ng-container's authored children are created after its directive constructors. A
            // container's attached views belong after those children in Angular's serialized order.
            effect(() => anchor.realign(), { debugName: 'RdxIdOwner.align' });
        return anchor.element;
    });
}
