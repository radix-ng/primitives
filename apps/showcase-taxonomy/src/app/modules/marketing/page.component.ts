import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonDirective } from '../../components/ui';

@Component({
    selector: 'page-marketing',
    templateUrl: './page.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ButtonDirective]
})
export class PageComponent {}
