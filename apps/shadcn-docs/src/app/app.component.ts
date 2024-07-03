import { JsonPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
    NavigationEnd,
    NavigationStart,
    Router,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
} from '@angular/router';

import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent } from '@ng-doc/app';

import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        JsonPipe,
        RouterLink,
        RouterLinkActive,
        NgDocRootComponent,
        NgDocNavbarComponent,
        NgDocSidebarComponent
    ],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    themeService = inject(ThemeService);
    router = inject(Router);

    title = 'easy-form-demo';
    loading = signal(false);

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
