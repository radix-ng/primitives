import { Component } from '@angular/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
import { RdxDateFieldInputDirective } from '../src/date-field-input.directive';
import { RdxDateFieldRootDirective } from '../src/date-field-root.directive';

@Component({
    selector: 'app-date-field-gregorian',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxDateFieldRoot" [granularity]="'second'" rdxDateFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldLocalesGregorian {
    readonly locale = 'en';
}

@Component({
    selector: 'app-date-field-japanese',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxDateFieldRoot" granularity="second" locale="ja" rdxDateFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldLocalesJapanese {}

@Component({
    selector: 'app-date-field-persian',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxDateFieldRoot" granularity="second" locale="fa-IR" rdxDateFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldLocalesPersian {}

@Component({
    selector: 'app-date-field-taiwan',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxDateFieldRoot" granularity="second" locale="zh-TW" rdxDateFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldLocalesTaiwan {}

@Component({
    selector: 'app-date-field-hebrew',
    imports: [RdxDateFieldRootDirective, RdxDateFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxDateFieldRoot" granularity="second" locale="he" rdxDateFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxDateFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'date-field.styles.css'
})
export class DateFieldLocalesHebrew {}
