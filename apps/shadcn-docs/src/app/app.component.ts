import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { ConfigService } from './services/config.service';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet
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
