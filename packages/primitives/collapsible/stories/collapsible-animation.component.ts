import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';

@Component({
    selector: 'rdx-collapsible-animation',
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsibleContentDirective,
        LucideAngularModule
    ],
    styles: `
        button {
            all: unset;
        }

        .expanded {
            height: 100%;
            opacity: 1;
            transition: 600ms cubic-bezier(0.37, 1.04, 0.68, 0.98);
        }

        .collapsed {
            height: 0;
            opacity: 0;
            transition: 600ms cubic-bezier(0.37, 1.04, 0.68, 0.98);
        }

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
        <div class="CollapsibleRoot" [open]="open()" (onOpenChange)="open.set($event)" rdxCollapsibleRoot>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="Text" style="color: white">&#64;peduarte starred 3 repositories</span>
                <button class="IconButton" type="button" rdxCollapsibleTrigger>
                    @if (open()) {
                        <lucide-angular size="16" name="x" style="display: flex;" />
                    } @else {
                        <lucide-angular size="16" name="unfold-vertical" style="display: flex;" />
                    }
                </button>
            </div>

            <div class="Repository">
                <span class="Text">&#64;radix-ui/primitives</span>
            </div>

            <div [class]="open() ? 'expanded' : 'collapsed'" rdxCollapsibleContent>
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
export class RdxCollapsibleAnimationComponent {
    open = signal(true);
}
