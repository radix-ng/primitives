import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    template: `
        <div>
            Code Block in astro page
            <button>Click me</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class NgBlockComponent {}
