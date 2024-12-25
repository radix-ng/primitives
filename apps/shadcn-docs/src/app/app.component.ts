import { JsonPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent } from '@ng-doc/app';
import { ConfigService } from './services/config.service';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        JsonPipe,
        RouterLink,
        RouterLinkActive,
        NgDocRootComponent,
        NgDocNavbarComponent,
        NgDocSidebarComponent
    ],
    providers: [ConfigService],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly themeService = inject(ThemeService);

    private loading = signal(false);

    constructor() {
        this.themeService.updateTheme();
    }

    ngOnInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.loading.set(true);
            } else if (event instanceof NavigationEnd) {
                this.loading.set(false);
            }
        });
    }
}
