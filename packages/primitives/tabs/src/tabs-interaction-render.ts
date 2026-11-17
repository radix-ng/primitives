import { afterEveryRender, ApplicationRef, inject, Injectable } from '@angular/core';

/** Tabs-local coordination of a pending interaction with the browser's native Tab default. */
@Injectable({ providedIn: 'root' })
export class TabsInteractionRender {
    private readonly application = inject(ApplicationRef);
    private readonly pending = new Set<object>();
    private flushing = false;

    constructor() {
        afterEveryRender(() => this.pending.clear());
    }

    mark(owner: object): void {
        this.pending.add(owner);
    }

    forget(owner: object): void {
        this.pending.delete(owner);
    }

    flush(owner: object): void {
        if (this.flushing || !this.pending.delete(owner)) return;
        this.flushing = true;
        try {
            // Controlled bindings can belong to an ancestor of the List's declaring view.
            // Finish pending Angular work before the browser computes its native Tab destination.
            this.application.tick();
        } finally {
            this.flushing = false;
        }
    }
}
