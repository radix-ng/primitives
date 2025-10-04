import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Component({
    selector: 'app-separator',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxSeparatorRootDirective],
    template: `
        <div rdxSeparatorRoot>***</div>
    `
})
export default class Page {}
