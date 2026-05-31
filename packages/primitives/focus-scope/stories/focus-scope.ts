import { Component } from '@angular/core';
import { RdxFocusScope } from '../src/focus-scope';

const focusScopeClasses = 'border-border bg-card flex min-w-72 flex-col gap-3 rounded-xl border p-5 shadow-sm';
const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'focus-scope-trapped',
    imports: [RdxFocusScope],
    template: `
        <div class="${focusScopeClasses}" rdxFocusScope trapped>
            <p class="text-muted-foreground text-sm leading-6">Focus stays inside this card.</p>
            <button class="${buttonClasses}">Action 1</button>
            <button class="${buttonClasses}">Action 2</button>
            <button class="${buttonClasses}">Close</button>
        </div>
    `
})
export class FocusScope {}

@Component({
    selector: 'focus-scope-trapped-loop',
    imports: [RdxFocusScope],
    template: `
        <div class="${focusScopeClasses}" rdxFocusScope trapped loop>
            <p class="text-muted-foreground text-sm leading-6">Tab loops from the last button back to the first.</p>
            <button class="${buttonClasses}">Action 1</button>
            <button class="${buttonClasses}">Action 2</button>
            <button class="${buttonClasses}">Close</button>
        </div>
    `
})
export class FocusScopeLoop {}

@Component({
    selector: 'focus-scope-events',
    imports: [RdxFocusScope],
    template: `
        <div
            class="${focusScopeClasses}"
            (mountAutoFocus)="handleMountFocus($event)"
            (unmountAutoFocus)="handleMountFocus($event)"
            rdxFocusScope
            trapped
            loop
        >
            <p class="text-muted-foreground text-sm leading-6">Auto-focus events are prevented in this example.</p>
            <button class="${buttonClasses}">Action 1</button>
            <button class="${buttonClasses}">Action 2</button>
            <button class="${buttonClasses}">Close</button>
        </div>
    `
})
export class FocusScopeEvents {
    handleMountFocus(event: any) {
        // Prevent default auto-focus behavior if needed
        event.preventDefault();
    }
}
