import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'avatar',
        loadComponent: () => import('./components/avatar/avatar.component')
    }
];
