import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'avatar',
        loadComponent: () => import('./components/avatar/avatar.component')
    },
    {
        path: 'accordion',
        loadComponent: () => import('./components/accordion/accordion.component')
    },
    {
        path: 'collapsible',
        loadComponent: () => import('./components/collapsible/collapsible.component')
    }
];
