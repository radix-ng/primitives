import { Component } from '@angular/core';
import { RdxCodeComponent } from '@radix-ng/components/code';
import { RdxThemeDirective } from '@radix-ng/components/theme';

@Component({
    selector: 'kbd-sizes-demo',
    standalone: true,
    imports: [RdxThemeDirective, RdxCodeComponent],
    template: `
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-code size="1">console.log()</rdx-code>
            <rdx-code size="2">console.log()</rdx-code>
            <rdx-code size="3">console.log()</rdx-code>
            <rdx-code size="4">console.log()</rdx-code>
            <rdx-code size="5">console.log()</rdx-code>
            <rdx-code size="6">console.log()</rdx-code>
            <rdx-code size="7">console.log()</rdx-code>
            <rdx-code size="8">console.log()</rdx-code>
        </div>
    `
})
export class CodeSizeComponent {}

export default CodeSizeComponent;
