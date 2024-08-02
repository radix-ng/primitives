import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-block-toolbar',
    standalone: true,
    template: `
        <div
            class="mb-4 flex flex-col items-center gap-4 sm:flex-row"
            id="{{ blockName }}"
        >
            <div class="flex items-center gap-2">
                <a href="#{{ blockName }}">
                    <div
                        class="focus:ring-ring text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-md border border-transparent bg-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                        {{ blockName }}
                    </div>
                </a>
            </div>
        </div>
    `,
    styles: []
})
export class BlockToolbarComponent {
    @Input() blockName: string | undefined;
}
