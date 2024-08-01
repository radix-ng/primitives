import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [ShButtonDirective],
    template: `
        <button
            (click)="toggleTheme()"
            shButton
            variant="secondary"
        >
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>
    `,
    styles: []
})
export class ThemeToggleComponent implements OnInit {
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    isDarkMode = false;

    ngOnInit() {
        const theme = localStorage.getItem('theme');
        this.isDarkMode = theme === 'dark';
        if (this.isDarkMode) {
            this.renderer.addClass(this.document.body, 'dark');
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            this.renderer.addClass(this.document.body, 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            this.renderer.removeClass(this.document.body, 'dark');
            localStorage.setItem('theme', 'light');
        }
    }
}
