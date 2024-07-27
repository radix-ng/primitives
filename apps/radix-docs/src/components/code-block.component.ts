import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    template: `
        <div>
            Hello Code Block in MDX
            <button>Click me</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class CodeBlockComponent {}
