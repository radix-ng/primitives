import { signal, WritableSignal } from '@angular/core';

export function createGlobalState<T>(factory: () => T): () => T {
    const state = factory();
    return () => state;
}

export interface FocusScopeAPI {
    paused: WritableSignal<boolean>;
    pause(): void;
    resume(): void;
}

const useFocusStackState = createGlobalState(() => signal<FocusScopeAPI[]>([]));

export function createFocusScopesStack() {
    /** A stack of focus scopes, with the active one at the top */
    const stack = useFocusStackState();

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
