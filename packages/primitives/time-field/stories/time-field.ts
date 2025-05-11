import { Component } from '@angular/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

import { RdxTimeFieldInputDirective } from '../src/time-field-input.directive';
import { RdxTimeFieldRootDirective } from '../src/time-field-root.directive';

@Component({
    selector: 'app-time-field',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <div class="DateField" #root="rdxTimeFieldRoot" granularity="second" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeField {}

@Component({
    selector: 'app-time-field-granular-second',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Second:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" granularity="second" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldGranularSecond {}

@Component({
    selector: 'app-time-field-granular-minute',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Minute:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" granularity="minute" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldGranularMinute {}

@Component({
    selector: 'app-time-field-granular-hour',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Hour:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" granularity="hour" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldGranularHour {}

@Component({
    selector: 'app-time-field-locale-gregorian',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Gregorian:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" granularity="second" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldLocaleGregorian {}

@Component({
    selector: 'app-time-field-locale-japanese',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Japanese:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" locale="ja" granularity="second" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldLocaleJapanese {}

@Component({
    selector: 'app-time-field-locale-persian',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Persian:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" locale="fa-IR" granularity="second" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldLocalePersian {}

@Component({
    selector: 'app-time-field-locale-taiwan',
    imports: [RdxTimeFieldRootDirective, RdxTimeFieldInputDirective, RdxVisuallyHiddenInputDirective],
    template: `
        <div class="DateFieldWrapper">
            <label style="color: white;">Taiwan:</label>
            <div class="DateField" #root="rdxTimeFieldRoot" locale="zh-TW" granularity="second" rdxTimeFieldRoot>
                @for (item of root.segmentContents(); track $index) {
                    @if (item.part === 'literal') {
                        <div class="DateFieldLiteral" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    } @else {
                        <div class="DateFieldSegment" [part]="item.part" rdxTimeFieldInput>
                            {{ item.value }}
                        </div>
                    }
                }
                <input [value]="root.value()" rdxVisuallyHiddenInput feature="focusable" />
            </div>
        </div>
    `,
    styleUrl: 'time-field.styles.css'
})
export class TimeFieldLocaleTaiwan {}
