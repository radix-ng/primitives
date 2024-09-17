import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';

@Component({
    selector: 'rdx-collapsible-external-triggering',
    standalone: true,
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleContentDirective,
        LucideAngularModule
    ],
    styles: `
        .CollapsibleRoot {
            width: 300px;
        }

        .ExternalTrigger {
            font-family: inherit;
            border-radius: 8px;

            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--violet-11);
            box-shadow: 0 2px 10px var(--black-a7);
            margin-bottom: 10px;
            padding: 4px;
        }

        .ExternalTrigger[data-state='closed'] {
            background-color: white;
        }

        .ExternalTrigger[data-state='open'] {
            background-color: var(--violet-3);
        }

        .ExternalTrigger:hover {
            background-color: var(--violet-3);
        }

        .ExternalTrigger:focus {
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
        <button class="ExternalTrigger" (click)="open = !open">External Trigger</button>
        <div class="CollapsibleRoot" #collapsibleRoot="collapsibleRoot" [open]="open" rdxCollapsibleRoot>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="Text" style="color: white">&#64;peduarte starred 3 repositories</span>
            </div>

            <div class="Repository">
                <span class="Text">&#64;radix-ui/primitives</span>
            </div>

            <div rdxCollapsibleContent>
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
export class RdxCollapsibleExternalTriggeringComponent {
    open = true;
}
