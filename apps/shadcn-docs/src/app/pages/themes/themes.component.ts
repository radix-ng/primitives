import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShCardContentDirective,
    ShCardDirective,
    ShCardHeaderDirective,
    ShCardTitleDirective
} from '@radix-ng/shadcn/card';
import { cn } from '@radix-ng/shadcn/core';
import { themes } from '@radix-ng/shadcn/theme';
import { LucideAngularModule } from 'lucide-angular';

import { ConfigService } from '../../services/config.service';
import { ThemeService } from '../../services/theme.service';
import { CardChatComponent } from './cards/card-chat.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        RouterLink,
        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardContentDirective,
        ShButtonDirective,
        LucideAngularModule,
        CardChatComponent
    ],
    templateUrl: './themes.component.html'
})
export class ThemesComponent {
    private readonly themeService = inject(ThemeService);
    private readonly config = inject(ConfigService);

    themes = themes;
    radius = ['0', '0.3', '0.5', '0.75', '1.0'];

    currentThemeName = this.config.getConfig().theme;
    currentThemeRadius = this.config.getConfig().radius;

    mode = this.themeService.colorScheme;

    cn = cn;

    onClickChangeTheme(theme: any) {
        this.config.setConfig({
            ...this.config.getConfig(),
            theme: theme.name
        });

        this.currentThemeName = theme.name;

        this.themeService.updateTheme(this.config.getConfig());
    }

    onClickChangeRadiusTheme(radius: string) {
        this.config.setConfig({
            ...this.config.getConfig(),
            radius: parseFloat(radius)
        });

        this.currentThemeRadius = parseFloat(radius);

        this.themeService.updateTheme(this.config.getConfig());
    }

    protected readonly parseFloat = parseFloat;
}
