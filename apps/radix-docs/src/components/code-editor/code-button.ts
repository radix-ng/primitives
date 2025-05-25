import { useStackBlitz } from '@/components/code-editor/code-api.ts';
import { Component, input } from '@angular/core';

@Component({
    selector: 'code-button',
    template: `
        <button
            class="flex cursor-default items-center gap-2 px-2 py-2 text-sm hover:underline"
            (click)="handleClick()"
        >
            StackBlitz
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentcolor" xmlns="http://www.w3.org/2000/svg">
                <path
                    transform="translate(0, -0.5)"
                    d="M7 2V3H10.293L4.02344 9.27344L4.72656 9.97656L11 3.70703V7H12V2H7ZM2 4C0.894531 4 0 4.89453 0 6V12C0 13.1055 0.894531 14 2 14H8C9.10547 14 10 13.1055 10 12V7L9 8V12C9 12.5508 8.55078 13 8 13H2C1.44922 13 1 12.5508 1 12V6C1 5.44922 1.44922 5 2 5H6L7 4H2Z"
                />
            </svg>
        </button>
    `
})
export class CodeButton {
    readonly code = input<string>();
    readonly name = input<string>();
    readonly css = input<string>();

    protected handleClick() {
        if (this.code()) {
            useStackBlitz({
                code: this.code(),
                css: this.css(),
                selector: this.name()
            });
        }
    }
}
