import { Component, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { usePresence } from '../src/presence';
import { CollapseContext, transitionCollapsing } from '../src/transitions/transition.collapse';

@Component({
    selector: 'app-presence',
    standalone: true,
    template: `
        <div>
            <button (click)="toggle()">Toggle</button>
            <div
                class="collapse-content"
                #collapseContent
            >
                Content to be collapsed
            </div>
        </div>
    `,
    styles: [
        `
            .collapse-content {
                overflow: hidden;
                transition: height 0.5s ease-in-out;
            }
            .collapse:not(.show) {
                display: none;
            }
            .show {
                height: auto;
            }
        `

    ]
})
export class PresenceStoryComponent implements OnInit {
    private elRef = inject(ElementRef);
    private zone = inject(NgZone);

    private element!: HTMLElement;

    private _isCollapsed = false;
    private afterInit = false;

    set collapsed(isCollapsed: boolean) {
        if (this._isCollapsed !== isCollapsed) {
            this._isCollapsed = isCollapsed;
            if (this.afterInit) {
                this.initCollapse(this._isCollapsed, true);
            }
        }
    }

    ngOnInit(): void {
        this.element = this.elRef.nativeElement.querySelector('.collapse-content');
        this.initCollapse(this._isCollapsed, false);
        this.afterInit = true;
    }

    toggle(open: boolean = this._isCollapsed) {
        this.collapsed = !open;
    }

    private initCollapse(collapsed: boolean, animation: boolean): void {
        const options = {
            context: {
                direction: collapsed ? 'hide' : 'show',
                dimension: 'height'
            } as CollapseContext,
            animation
        };

        usePresence(this.zone, this.element, transitionCollapsing, options).subscribe();
    }
}
