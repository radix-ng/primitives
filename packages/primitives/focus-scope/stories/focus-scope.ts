import { Component } from '@angular/core';
import { RdxFocusScope } from '../src/focus-scope';

@Component({
    selector: 'focus-scope-trapped',
    imports: [RdxFocusScope],
    template: `
        <div rdxFocusScope trapped>
            <button>Action 1</button>
            <button>Action 2</button>
            <button>Close</button>
        </div>
    `
})
export class FocusScope {}

@Component({
    selector: 'focus-scope-trapped-loop',
    imports: [RdxFocusScope],
    template: `
        <div rdxFocusScope trapped loop>
            <button>Action 1</button>
            <button>Action 2</button>
            <button>Close</button>
        </div>
    `
})
export class FocusScopeLoop {}

@Component({
    selector: 'focus-scope-events',
    imports: [RdxFocusScope],
    template: `
        <div
            (mountAutoFocus)="handleMountFocus($event)"
            (unmountAutoFocus)="handleMountFocus($event)"
            rdxFocusScope
            trapped
            loop
        >
            <button>Action 1</button>
            <button>Action 2</button>
            <button>Close</button>
        </div>
    `
})
export class FocusScopeEvents {
    handleMountFocus(event: any) {
        // Prevent default auto-focus behavior if needed
        event.preventDefault();
    }
}
