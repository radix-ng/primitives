import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';

@Component({
    selector: 'rdx-collapsible-animation',
    standalone: true,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective
    ],
    animations: [
        trigger('contentExpansion', [
            state('expanded', style({ height: '*', opacity: 1, visibility: 'visible' })),
            state('collapsed', style({ height: '0px', opacity: 0, visibility: 'hidden' })),
            transition('expanded <=> collapsed', animate('200ms cubic-bezier(.37,1.04,.68,.98)'))
        ])
    ],
    styles: `
        .CollapsibleRoot {
            width: 300px;
        }

        .IconButton {
            font-family: inherit;
            border-radius: 100%;
            height: 25px;
            width: 25px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--violet-11);
            box-shadow: 0 2px 10px var(--black-a7);
        }

        .IconButton[data-state='closed'] {
            background-color: white;
        }

        .IconButton[data-state='open'] {
            background-color: var(--violet-3);
        }

        .IconButton:hover {
            background-color: var(--violet-3);
        }

        .IconButton:focus {
            box-shadow: 0 0 0 2px black;
        }

        .Text {
            color: var(--violet-11);
            font-size: 15px;
            line-height: 25px;
        }

        .Repository {
            background-color: white;
            border-radius: 4px;
            margin: 10px 0;
            padding: 10px;
            box-shadow: 0 2px 10px var(--black-a7);
        }
    `,
    template: `
        <div
            class="CollapsibleRoot"
            CollapsibleRoot
            #collapsibleRoot="collapsibleRoot"
            [open]="true"
        >
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="Text" style="color: white">&#64;peduarte starred 3 repositories</span>
                <button class="IconButton" CollapsibleTrigger></button>
            </div>

            <div class="Repository">
                <span class="Text">&#64;radix-ui/primitives</span>
            </div>

            <div
                CollapsibleContent
                [@contentExpansion]="collapsibleRoot.isOpen() ? 'expanded' : 'collapsed'"
            >
                <div class="Repository">
                    <span class="Text">&#64;radix-ui/colors</span>
                </div>
                <div class="Repository">
                    <span class="Text">&#64;stitches/react</span>
                </div>
            </div>
        </div>
    `
})
export class RdxCollapsibleAnimationComponent {}
