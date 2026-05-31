import { Component, signal } from '@angular/core';
import { RdxFocusScope } from '../src/focus-scope';

const demoClasses = 'flex w-xl flex-col gap-4';
const focusScopeClasses = 'border-border bg-card flex flex-col gap-3 rounded-xl border p-5 shadow-sm';
const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const primaryButtonClasses =
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'focus-scope-trapped',
    imports: [RdxFocusScope],
    template: `
        <section class="${demoClasses}">
            <div>
                <h3 class="text-base font-semibold">Trapped focus</h3>
                <p class="text-muted-foreground mt-1 text-sm leading-6">
                    Click the outside button while the scope is open. Focus is restored to the last focused control
                    inside the card.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button class="${primaryButtonClasses}" (click)="open.set(true)" type="button">Open scope</button>
                <button class="${buttonClasses}" type="button">Outside action</button>
            </div>
            @if (open()) {
                <div class="${focusScopeClasses}" rdxFocusScope trapped>
                    <p class="text-sm font-medium">Profile actions</p>
                    <button class="${buttonClasses}" type="button">Edit profile</button>
                    <button class="${buttonClasses}" type="button">Change password</button>
                    <button class="${buttonClasses}" (click)="open.set(false)" type="button">Close scope</button>
                </div>
            }
        </section>
    `
})
export class FocusScope {
    readonly open = signal(false);
}

@Component({
    selector: 'focus-scope-trapped-loop',
    imports: [RdxFocusScope],
    template: `
        <section class="${demoClasses}">
            <div>
                <h3 class="text-base font-semibold">Looping navigation</h3>
                <p class="text-muted-foreground mt-1 text-sm leading-6">
                    Use Tab and Shift+Tab. Focus wraps between the first and last controls without leaving the card.
                </p>
            </div>
            <div class="${focusScopeClasses}" rdxFocusScope loop>
                <button class="${buttonClasses}" type="button">First action</button>
                <button class="${buttonClasses}" type="button">Second action</button>
                <button class="${buttonClasses}" type="button">Last action</button>
            </div>
        </section>
    `
})
export class FocusScopeLoop {}

@Component({
    selector: 'focus-scope-events',
    imports: [RdxFocusScope],
    template: `
        <section class="${demoClasses}">
            <div>
                <h3 class="text-base font-semibold">Preventing auto-focus</h3>
                <p class="text-muted-foreground mt-1 text-sm leading-6">
                    Open the scope. The mount event is prevented, so focus stays on the trigger instead of moving into
                    the card.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button class="${primaryButtonClasses}" (click)="open.set(true)" type="button">Open scope</button>
                <span class="text-muted-foreground text-sm">{{ status() }}</span>
            </div>
            @if (open()) {
                <div
                    class="${focusScopeClasses}"
                    (mountAutoFocus)="handleAutoFocus('Mount', $event)"
                    (unmountAutoFocus)="handleAutoFocus('Unmount', $event)"
                    rdxFocusScope
                >
                    <button class="${buttonClasses}" type="button">Action 1</button>
                    <button class="${buttonClasses}" type="button">Action 2</button>
                    <button class="${buttonClasses}" (click)="open.set(false)" type="button">Close scope</button>
                </div>
            }
        </section>
    `
})
export class FocusScopeEvents {
    readonly open = signal(false);
    readonly status = signal('No auto-focus event yet');

    handleAutoFocus(name: 'Mount' | 'Unmount', event: Event) {
        event.preventDefault();
        this.status.set(`${name} auto-focus prevented`);
    }
}
