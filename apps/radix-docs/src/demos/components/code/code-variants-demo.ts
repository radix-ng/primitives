import { Component } from '@angular/core';
import { RdxCodeComponent } from '@radix-ng/components/code';

@Component({
    selector: 'kbd-variants-demo',
    standalone: true,
    imports: [RdxCodeComponent],
    template: `
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-code variant="solid">console.log()</rdx-code>
            <rdx-code variant="soft">console.log()</rdx-code>
            <rdx-code variant="outline">console.log()</rdx-code>
            <rdx-code variant="ghost">console.log()</rdx-code>
        </div>
    `
})
export class CodeVariantsComponent {}

export default CodeVariantsComponent;
