import { Component, ElementRef, NgZone, OnInit } from '@angular/core';

import { usePresence } from '../src/presence';
import { CollapseContext, transitionCollapsing } from '../src/transitions/transition.collapse';

@Component({
    selector: 'app-presence',
    template: `
        <div #element>Presence Component</div>
    `,
    styles: [
        `
            .collapse {
                transition: height 0.5s ease-in-out;
            }
            .collapsing {
                height: 0px;
            }
            .show {
                height: auto;
            }
        `
    ]
})
export class PresenceComponent implements OnInit {
    private context: CollapseContext = {
        direction: 'show',
        dimension: 'height'
    };
    private element!: HTMLElement;

    constructor(
        private zone: NgZone,
        private elRef: ElementRef
    ) {}

    ngOnInit(): void {
        this.element = this.elRef.nativeElement.querySelector('div');
        const options = {
            context: this.context,
            animation: true,
            state: 'stop' as const
        };

        usePresence(this.zone, this.element, transitionCollapsing, options).subscribe();
    }

    getContext(): CollapseContext {
        return this.context;
    }
}
