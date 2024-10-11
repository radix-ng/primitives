import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'rdx-form-message',
    standalone: true,
    imports: [NgFor],
    template: `
        @for (error of errors; track error.key) {
            {{ error.message }}
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'class'
    }
})
export class RdxFormMessageComponent {
    @Input() class = '';
    errors: FormatedError[] = [];
}

export type FormatedError = {
    key: string;
    message: string;
};

export type ValidateOnFn = (status: { dirty: boolean; touched: boolean; submitted: boolean }) => boolean;
