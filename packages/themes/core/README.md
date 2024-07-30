```typescript
import { Component, OnInit } from '@angular/core';

import { ThemeService } from './theme.service';

@Component({
    selector: 'app-your-component',
    templateUrl: './your-component.component.html',
    styleUrls: ['./your-component.component.css'],
    standalone: true,
    providers: [
        ThemeService,
        ...provideThemeConfig({ useLocalStorage: true, nameLocalStorageKey: 'data-theme', elementTheme: 'myElement' })
    ]
})
export class YourComponent implements OnInit {
    constructor(private themeService: ThemeService) {
        // Set the element on which the data-theme attribute will be applied
        this.themeService.setThemeElement(document.getElementById('my-element'));
    }

    ngOnInit(): void {
        //
    }

    /**
     * Toggles the current theme between light and dark.
     */
    toggleTheme(): void {
        this.themeService.toggle();
    }
}
```

## Explanation

1. ThemeService

-   The ThemeService class handles theme management, including applying themes, toggling themes, and optionally storing the theme in localStorage.
-   The setThemeElement method allows setting the DOM element where the data-theme attribute will be applied. By default, it applies to the body.
-   The theme is applied reactively using Angular's effect to listen for changes in the theme signal.

2. tokens.ts

-   An InjectionToken named USE_LOCAL_STORAGE is created to configure whether to use localStorage for theme persistence.

3. YourModule:

-   The ThemeService is provided at the module level along with the USE_LOCAL_STORAGE token configuration.

4. YourComponent:

-   Demonstrates how to use ThemeService in a component, including setting the theme element and toggling the theme.
