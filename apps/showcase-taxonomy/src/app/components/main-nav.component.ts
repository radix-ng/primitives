import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'main-nav',
    standalone: true,
    template: `
        <div class="flex gap-6 md:gap-10">
            <a href="/" class="hidden items-center space-x-2 md:flex">
                <span class="hidden font-bold sm:inline-block"> Taxonomy </span>
            </a>
            <nav class="hidden gap-6 md:flex">
                <!-- Items -->
            </nav>
        </div>
    `,
    exportAs: 'HorizontalNavigation',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainNavComponent {
    @Input() navigation: [] = [];
}
