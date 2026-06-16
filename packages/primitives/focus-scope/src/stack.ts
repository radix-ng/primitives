import { signal, WritableSignal } from '@angular/core';

export interface FocusScopeAPI {
    paused: WritableSignal<boolean>;
    pause(): void;
    resume(): void;
}

/**
 * The active-scope stack pauses/resumes scopes, so it **is** cross-document coordination state — keyed
 * per owner `Document` (a `WeakMap`) rather than process-global (ADR 0017 Phase 1a): opening a scope in
 * document B must not pause document A's scope.
 */
const stacksByDocument = new WeakMap<Document, WritableSignal<FocusScopeAPI[]>>();

function getFocusStackState(document: Document): WritableSignal<FocusScopeAPI[]> {
    let state = stacksByDocument.get(document);
    if (!state) {
        state = signal<FocusScopeAPI[]>([]);
        stacksByDocument.set(document, state);
    }
    return state;
}

export function createFocusScopesStack(document: Document) {
    /** A stack of focus scopes for this document, with the active one at the top */
    const stack = getFocusStackState(document);

    return {
        add(focusScope: FocusScopeAPI) {
            const current = stack();
            const active = current[0];
            if (focusScope !== active) {
                active?.pause();
            }
            const updated = arrayRemove(current, focusScope);
            updated.unshift(focusScope);
            stack.set(updated);
        },

        remove(focusScope: FocusScopeAPI) {
            const current = stack();
            const updated = arrayRemove(current, focusScope);
            stack.set(updated);
            // после удаления «возобновляем» новый верхний
            stack()[0]?.resume();
        }
    };
}

export function arrayRemove<T>(array: T[], item: T): T[] {
    const copy = [...array];
    const idx = copy.indexOf(item);
    if (idx !== -1) {
        copy.splice(idx, 1);
    }
    return copy;
}

export function removeLinks(items: HTMLElement[]): HTMLElement[] {
    return items.filter((el) => el.tagName !== 'A');
}
